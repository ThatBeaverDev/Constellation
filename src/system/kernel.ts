import * as installer from "./installation/index.js";

import { FilesystemAPI } from "../fs/fs.js";

import { executionResult, ProgramRuntime } from "./runtime/runtime.js";
import panic from "./lib/panic.js";
import {
	ConstellationConfiguration,
	defaultConfiguration
} from "./constellation.config.js";
import Security from "./security/index.js";
import { GraphicalInterface } from "./gui/gui.js";
import blobifier from "./lib/blobify.js";
import LoggingAPI, { CapitalisedLogLevel } from "./lib/logging.js";
import { TextInterface } from "./tui/tui.js";
import { tcupkg } from "./lib/packaging/tcupkg.js";
import { ConstellationFileIndex } from "./lib/packaging/definitions.js";
import { tcpkg } from "./lib/packaging/tcpkg.js";
import postinstall from "./installation/postinstall.js";
import IPCMessageSender from "./runtime/components/messages.js";
import { UserInterface } from "./ui/ui.js";
import { getFlagValue } from "./lib/flags.js";
import restartKernel from "./state/restart.js";

if (defaultConfiguration.dynamic.isDevmode) {
	(globalThis as any).kernels = [];
}
const path = "/System/kernel.js";

interface ConstellationKernelConfiguration {
	installationIdx?: ConstellationFileIndex;
	install?: boolean;
}

export interface Terminatable {
	terminate(): Promise<void> | void;
}

let kernelID = 0;
export default class ConstellationKernel implements Terminatable {
	id: number = kernelID++;

	// subsystems
	fs: FilesystemAPI & Terminatable;
	security: Security & Terminatable;
	runtime: ProgramRuntime & Terminatable;
	config: ConstellationConfiguration;
	lib: {
		blobifier: blobifier;
		logging: LoggingAPI;
		messageAPI: IPCMessageSender;
		packaging: {
			tcpkg: (
				packageDirectory: string
			) => Promise<ConstellationFileIndex>;
			tcupkg: (
				idxFile: ConstellationFileIndex,
				directory: string
			) => Promise<void>;
		};
	};
	logs: [CapitalisedLogLevel, string, ...any[]][];
	isTerminated: boolean = false;
	#install: (
		ConstellationKernel: ConstellationKernel,
		isSoftwareUpdate: boolean
	) => Promise<boolean>;
	async triggerUpdate() {
		await this.fs.writeFile("/System/message.txt", "updateSystem");

		// new kernel handles it :>
		const newKernel = this.restart();
	}

	// property types
	ui: UserInterface;

	constructor(
		public rootPoint: string,
		public isGraphical: boolean,
		logs: any[] = [],
		FsAPI: FilesystemAPI,
		public startupConfiguration?: ConstellationKernelConfiguration
	) {
		if (defaultConfiguration.dynamic.isDevmode) {
			(globalThis as any).kernels.push(this);
		}

		if (!isGraphical && window.document) {
			// remove boot page if we're booting TUI
			const bootBackground = document.querySelector("div.bootCover");

			if (bootBackground) bootBackground.remove();
		}

		this.logs = logs;

		try {
			if (startupConfiguration?.installationIdx) {
				this.#install = async () => {
					if (startupConfiguration?.installationIdx == undefined)
						return false;

					await tcupkg(
						this,
						startupConfiguration.installationIdx,
						"/"
					);

					return false;
				};
			} else {
				this.#install = async (
					kernel: ConstellationKernel,
					isUpdate: boolean
				) => {
					return await installer.install(kernel, isUpdate);
				};
			}
		} catch (e) {
			// TODO: PANIC
			throw e;
		}

		// subsystems
		this.fs = FsAPI;
		this.lib = {
			blobifier: new blobifier(this.fs),
			logging: new LoggingAPI(this),
			messageAPI: new IPCMessageSender(),
			packaging: {
				// preinsert the `ConstellationKernel` arguement.
				tcpkg: tcpkg.bind(undefined, this),
				tcupkg: tcupkg.bind(undefined, this)
			}
		};
		this.security = new Security(this);
		this.runtime = new ProgramRuntime(this);
		this.config = structuredClone(defaultConfiguration);

		// assign based on runtime flag
		if (isGraphical) {
			this.ui = new GraphicalInterface(this);
		} else {
			this.ui = new TextInterface(this);
		}

		try {
			this.init();
		} catch (e: unknown) {
			panic(this, e, "systemInit");
		}
	}

	setBootStatus(
		text: string | Error,
		state: "working" | "error" = "working"
	) {
		this.config.dynamic.status = String(text);

		if (this.ui) this.ui.setStatus(text, state);

		if (state == "error") {
			this.lib.logging.error(path, text);
		} else {
			this.lib.logging.debug(path, text);
		}
	}

	async init() {
		await this.fs.init();

		const forceInstaller = Boolean(getFlagValue("forceInstall"));

		// work out whether we need to install
		const configFileExists =
			(await this.fs.readFile("/System/config.json")) !== undefined;
		const isSoftwareUpdate =
			(await this.fs.readFile("/System/message.txt")) == "updateSystem";

		if (isSoftwareUpdate) {
			await this.fs.unlink("/System/message.txt");
		}

		const canInstallFlag = this.startupConfiguration?.install;
		const canInstallFlagAbsolute =
			canInstallFlag == undefined ? true : canInstallFlag;

		const installerRequired =
			((!configFileExists || forceInstaller) && canInstallFlagAbsolute) ||
			isSoftwareUpdate;

		// install if needed
		let guiInstallerRequired = false;
		if (installerRequired) {
			// install and terminate so the kernel we wrote to disk can boot
			await this.#install(this, isSoftwareUpdate);

			// terminate if it's not a software update
			if (!isSoftwareUpdate) {
				this.terminate();
				return;
			}
		} else if (this.config.dynamic.isDevmode) {
			guiInstallerRequired = false;
		} else {
			const config = await this.fs.readFile("/System/config.json");

			if (config == undefined)
				throw new Error(
					"Config file became undefined between check and installation execution"
				);

			const configJson: ConstellationConfiguration = JSON.parse(config);

			guiInstallerRequired = !configJson.guiInstallerRan;
		}

		await this.security.init();

		if (this.ui) {
			await this.ui.init();
		}
		await this.runtime.init();

		// remove bootUI now that we're done
		if (this.ui.type == "GraphicalInterface") {
			const bootBackground = document.querySelector("div.bootCover");
			if (bootBackground) bootBackground.classList.add("fadeOut");

			if (bootBackground) setTimeout(() => bootBackground.remove(), 5000);
		}

		// start kernel execution loop
		this.executionLoop();

		const runGuiInstaller = async () => {
			const log = this.lib.logging.log.bind(this.lib.logging, path);
			const debug = this.lib.logging.debug.bind(this.lib.logging, path);

			const guiInstallerPath =
				"/System/CoreExecutables/OOBEInstaller.appl";

			const pipe: any[] = [];

			log("Running GUI installer");
			const exec = await this.runtime.execute(
				guiInstallerPath,
				pipe,
				"system",
				this.config.systemPassword,
				undefined,
				true,
				true,
				this.ui instanceof TextInterface
					? {
							print: this.ui.displayInterface.post,
							getInput: this.ui.displayInterface.getInput,
							clearView: this.ui.displayInterface.clearView
						}
					: undefined
			);

			debug("Attaching background check for GUI installer completion");
			let interval = setInterval(() => {
				if (pipe.length > 0) {
					log("GUI installer has completed.");
					postinstall(this, pipe[0]);

					debug("Terminating GUI installer.");
					if ("process" in exec)
						this.runtime.terminateProcess(exec.process);

					clearInterval(interval);
					return;
				}
			});

			await exec.promise;
		};

		if (guiInstallerRequired) {
			await runGuiInstaller();
		}

		// write to config
		const config = await this.fs.readFile("/System/config.json");

		if (config == undefined)
			throw new Error(
				"Config file became undefined between check and installation execution"
			);

		const configJson: ConstellationConfiguration = JSON.parse(config);
		configJson.guiInstallerRan = true;

		// write back to disc
		await this.fs.writeFile(
			"/System/config.json",
			JSON.stringify(configJson)
		);

		await this.ui.postinstall();

		const coreExecDirectory = "/System/CoreExecutables/CoreExecutable.srvc";

		this.security.permissions.setDirectoryPermission(
			coreExecDirectory,
			"operator",
			true
		);
		this.security.permissions.setDirectoryPermission(
			coreExecDirectory,
			"managePermissions",
			true
		);

		let exec: executionResult;

		try {
			exec = await this.runtime.execute(
				coreExecDirectory,
				[],
				"system",
				this.config.systemPassword,
				undefined,
				false
			);
		} catch (e) {
			panic(this, e, "executeCoreExecutableDuringStartup");
			return;
		}

		await exec.promise;
		// now this means that the core process has terminated and the system can power off.

		await this.terminate();
	}

	async executionLoop() {
		const frame = async () => {
			return new Promise((resolve: Function) => {
				try {
					this.runtime.frame();
				} catch (e) {
					panic(this, e, "processExecutionFrame");
				}
				setTimeout(resolve, 10);
			});
		};

		while (true) {
			if (this.isTerminated) {
				console.warn("`executionLoop` ran on terminated kernel.");
				return;
			}

			await frame();
		}
	}

	restart(passInstaller?: boolean) {
		return restartKernel(this, passInstaller);
	}

	async terminate() {
		this.lib.logging.debug(path, "Kernel", this, "terminating.");
		this.isTerminated = true;

		await this.runtime.terminate();
		await this.security.terminate();

		this.lib.blobifier.terminate();

		await this.ui.terminate();
		await this.fs.terminate();

		// remove from list
		if (defaultConfiguration.dynamic.isDevmode) {
			(globalThis as any).kernels = (globalThis as any).kernels.filter(
				(kernel: any) => kernel !== this
			);
		}
	}
}
