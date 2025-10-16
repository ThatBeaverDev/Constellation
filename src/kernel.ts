import * as installer from "./installation/index.js";

import { FilesystemAPI } from "./fs/fs.js";

import {
	executionResult,
	ProgramRuntime,
	terminate
} from "./runtime/runtime.js";
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

if (defaultConfiguration.dynamic.isDevmode) {
	(window as any).kernels = [];
}
const path = "/System/kernel.js";
path;

export interface GraphicalKernel extends Terminatable {
	isGraphical: true;
	GraphicalInterface: GraphicalInterface;
	TextInterface?: never;
}

export interface CommandLineKernel extends Terminatable {
	isGraphical: false;
	GraphicalInterface?: never;
	TextInterface?: TextInterface;
}

type Kernel = GraphicalKernel | CommandLineKernel;

interface ConstellationKernelConfiguration {
	installationIdx?: ConstellationFileIndex;
}

export interface Terminatable {
	terminate(): Promise<void> | void;
}

let kernelID = 0;
export default class ConstellationKernel<KernelType extends Kernel = Kernel>
	implements Terminatable
{
	id: number = kernelID++;

	// subsystems
	fs: FilesystemAPI & Terminatable;
	security: Security & Terminatable;
	runtime: ProgramRuntime & Terminatable;
	config: ConstellationConfiguration;
	lib: {
		blobifier: blobifier;
		logging: LoggingAPI;
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
	install: (ConstellationKernel: ConstellationKernel) => Promise<boolean>;

	// property types
	GraphicalInterface?: KernelType extends { isGraphical: true }
		? GraphicalInterface & Terminatable
		: undefined;
	TextInterface?: KernelType extends { isGraphical: false }
		? TextInterface & Terminatable
		: undefined;

	constructor(
		public rootPoint: string,
		public isGraphical: boolean,
		logs: any[] = [],
		public startupConfiguration?: ConstellationKernelConfiguration
	) {
		if (defaultConfiguration.dynamic.isDevmode) {
			(window as any).kernels.push(this);
		}

		this.logs = logs;

		try {
			if (startupConfiguration?.installationIdx) {
				this.install = async () => {
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
				this.install = installer.install;
			}
		} catch (e) {
			// TODO: PANIC
			throw e;
		}

		// subsystems
		this.fs = new FilesystemAPI(rootPoint);
		this.lib = {
			blobifier: new blobifier(this.fs),
			logging: new LoggingAPI(this),
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
			this.GraphicalInterface = new GraphicalInterface(this) as any;
		} else {
			this.TextInterface = new TextInterface(this) as any;
		}

		try {
			this.init();
		} catch (e) {
			panic(e, "systemInit");
		}
	}

	setBootStatus(
		text: string | Error,
		state?: "working" | "error" | "working"
	) {
		this.config.dynamic.status = String(text);

		if (this.GraphicalInterface)
			this.GraphicalInterface.setStatus(text, state);

		if (state == "error") {
			this.lib.logging.error(path, text);
		} else {
			this.lib.logging.debug(path, text);
		}
	}

	async init() {
		await this.fs.init();

		const forceInstaller =
			new URL(window.location.href).searchParams.get("forceInstall") !==
			null;

		let installerRequired =
			this.fs.readFile("/System/config.json") == undefined ||
			forceInstaller;

		let guiInstallerRequired = false;
		if (installerRequired) {
			guiInstallerRequired = await this.install(this);
		}

		await this.security.init();

		if (this.GraphicalInterface) {
			await this.GraphicalInterface.init();
		}
		await this.runtime.init();

		// remove bootUI now that we're done
		if (this.GraphicalInterface !== undefined) {
			const bootBackground = document.querySelector("div.bootCover");
			if (bootBackground) bootBackground.classList.add("fadeOut");

			if (bootBackground) setTimeout(() => bootBackground.remove(), 5000);

			// startup sound
			const bootSound = await this.fs.readFile(
				"/System/CoreAssets/Sounds/boot/iMacG3.mp3"
			);
			const sound = new Audio(bootSound);
			try {
				sound.play();
			} catch {}
			sound.remove();
		} else if (this.TextInterface !== undefined) {
			this.TextInterface.init();
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
				true
			);

			debug("Attaching background check for GUI installer completion");
			let interval = setInterval(() => {
				if (pipe.length > 0) {
					log("GUI installer has completed.");
					postinstall(this, pipe[0]);

					debug("Terminating GUI installer.");
					terminate(this, exec.process);

					clearInterval(interval);
					return;
				}
			});

			await exec.promise;
		};

		if (guiInstallerRequired) {
			await runGuiInstaller();
		}

		const coreExecDirectory =
			"/System/CoreExecutables/CoreExecutable.backgr";

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
			panic(e, "executeCoreExecutableDuringStartup");
			return;
		}

		await exec.promise;
		// now this means that the core process has terminated and the system can power off.

		await this.terminate();
	}

	async executionLoop() {
		const frame = async () => {
			return new Promise((resolve: Function) => {
				this.runtime.frame();
				setTimeout(resolve, 5);
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

	async terminate() {
		this.isTerminated = true;

		await this.runtime.terminate();
		await this.security.terminate();

		if (this.GraphicalInterface) await this.GraphicalInterface.terminate();
		if (this.TextInterface) await this.TextInterface.terminate();

		await this.fs.terminate();
	}
}
