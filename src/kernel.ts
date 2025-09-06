import * as installer from "./installation/index.js";

import { FilesystemAPI } from "./fs/fs.js";

import * as apps from "./runtime/runtime.js";
import panic from "./lib/panic.js";
import ConstellationConfiguration from "./constellation.config.js";
import Security from "./security/index.js";
import { GraphicalInterface } from "./gui/gui.js";
import blobifier from "./lib/blobify.js";
import LoggingAPI from "./lib/logging.js";
import { TextInterface } from "./tui/tui.js";

(window as any).kernels = [];
const path = "/System/kernel.js";

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

export default class ConstellationKernel<KernelType extends Kernel = Kernel> {
	verboseBootUIInterval?: ReturnType<typeof setInterval>;

	// subsystems
	fs: FilesystemAPI;
	security: Security;
	runtime: apps.ProgramRuntime;
	config: ConstellationConfiguration;
	lib: { blobifier: blobifier; logging: LoggingAPI };

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
		logs: any[] = []
	) {
		(window as any).kernels.push(this);

		// subsystems
		this.fs = new FilesystemAPI(rootPoint);
		this.security = new Security(this);
		this.runtime = new apps.ProgramRuntime(this);
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
			logging: new LoggingAPI()
		};

		try {
			this.init();
		} catch (e) {
			panic(e, "systemInit");
		}
	}

	async init() {
		await this.fs.init();

		await installer.install(this);

		await this.security.init();

		if (this.GraphicalInterface) {
			await this.GraphicalInterface.init();
		}
		await this.runtime.init();

		if (this.isGraphical) {
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

		try {
			const exec = await this.runtime.execute(
				coreExecDirectory,
				[],
				"system",
				this.config.systemPassword,
				undefined,
				false
			);
			this.lib.logging.warn(path, exec);
		} catch (e) {
			panic(e, "executeCoreExecutableDuringStartup");
		}

		let ok = true;
		setInterval(async () => {
			if (ok == false) return;
			ok = false;

			this.runtime.frame();

			ok = true;
		}, 50);
	}
}
