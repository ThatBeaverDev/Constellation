import * as installer from "./installation/index.js";

import { FilesystemAPI } from "./fs/fs.js";

import { executionResult, ProgramRuntime } from "./runtime/runtime.js";
import panic from "./lib/panic.js";
import ConstellationConfiguration from "./constellation.config.js";
import Security from "./security/index.js";
import { GraphicalInterface } from "./gui/gui.js";
import blobifier from "./lib/blobify.js";
import LoggingAPI from "./lib/logging.js";
import { TextInterface } from "./tui/tui.js";
import { tcupkg } from "./lib/packaging/tcupkg.js";
import { ConstellationFileIndex } from "./lib/packaging/definitions.js";
import { tcpkg } from "./lib/packaging/tcpkg.js";

(window as any).kernels = [];
const path = "/System/kernel.js";
path;

type GraphicalKernel = {
	isGraphical: true;
	GraphicalInterface: GraphicalInterface;
	TextInterface?: never;
};

type CommandLineKernel = {
	isGraphical: false;
	GraphicalInterface?: never;
	TextInterface?: TextInterface;
};

type Kernel = GraphicalKernel | CommandLineKernel;

interface ConstellationKernelConfiguration {
	installationIdx: ConstellationFileIndex;
}

export default class ConstellationKernel<KernelType extends Kernel = Kernel> {
	verboseBootUIInterval?: ReturnType<typeof setInterval>;
	executionInterval?: ReturnType<typeof setInterval>;

	// subsystems
	fs: FilesystemAPI;
	security: Security;
	runtime: ProgramRuntime;
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
	install: (ConstellationKernel: ConstellationKernel) => Promise<void>;

	// property types
	GraphicalInterface?: KernelType extends { isGraphical: true }
		? GraphicalInterface
		: undefined;
	TextInterface?: KernelType extends { isGraphical: false }
		? TextInterface
		: undefined;

	constructor(
		rootPoint: string,
		public isGraphical: boolean,
		logs: any[] = [],
		configuration?: ConstellationKernelConfiguration
	) {
		(window as any).kernels.push(this);

		this.install =
			configuration?.installationIdx == undefined
				? installer.install
				: async () => {
						await tcupkg(this, configuration.installationIdx, "/");
					};

		// subsystems
		this.fs = new FilesystemAPI(rootPoint);
		this.security = new Security(this);
		this.runtime = new ProgramRuntime(this);
		this.config = new ConstellationConfiguration(this);

		// assign based on runtime flag
		if (isGraphical) {
			this.GraphicalInterface = new GraphicalInterface(this) as any;
		} else {
			this.TextInterface = new TextInterface(this) as any;
		}

		if (isGraphical) {
			this.verboseBootUIInterval = setInterval(() => {
				const elem: HTMLParagraphElement =
					document.querySelector("p.bootText")!;

				if (elem !== null) {
					if (elem.innerText !== String(status)) {
						elem.innerText = String(status);
					}
				}
			});
		}

		this.lib = {
			blobifier: new blobifier(this.fs),
			logging: new LoggingAPI(),
			packaging: {
				// preinsert the `ConstellationKernel` arguement.
				tcpkg: tcpkg.bind(undefined, this),
				tcupkg: tcupkg.bind(undefined, this)
			}
		};

		try {
			this.init();
		} catch (e) {
			panic(e, "systemInit");
		}
	}

	async init() {
		await this.fs.init();

		await this.install(this);

		await this.security.init();

		if (this.GraphicalInterface) {
			await this.GraphicalInterface.init();
		}
		await this.runtime.init();

		if (this.GraphicalInterface !== undefined) {
			const bootBackground = document.querySelector("div.bootCover")!;
			bootBackground.classList.add("fadeOut");

			clearInterval(this.verboseBootUIInterval);

			setTimeout(() => bootBackground.remove(), 5000);

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
			this.TextInterface.init()
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

		let ok = true;
		this.executionInterval = setInterval(async () => {
			if (ok == false) return;
			ok = false;

			this.runtime.frame();

			ok = true;
		}, 50);

		await exec.promise;
		// now this means that the core process has terminated and the system can power off.

		await this.#terminate();
	}

	async #terminate() {
		clearInterval(this.executionInterval);
		clearInterval(this.verboseBootUIInterval);
	}
}
