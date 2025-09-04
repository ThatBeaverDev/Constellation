import * as installer from "./installation/index.js";

import fs, { FilesystemAPI, fsLoaded } from "./io/fs.js";

import * as apps from "./runtime/runtime.js";
import panic from "./lib/panic.js";
import { status, systemPassword } from "./constellation.config.js";
import Security from "./security/index.js";

declare global {
	interface String {
		textAfter(after: string): string;
		textAfterAll(after: string): string;
		textBefore(before: string): string;
		textBeforeLast(before: string): string;
		map(mappings: any): string;
	}
}
String.prototype.textAfter = function (after) {
	return this.split(after).splice(1, Infinity).join(after);
};

String.prototype.textAfterAll = function (after) {
	return this.split(after).pop() ?? "";
};

String.prototype.textBefore = function (before) {
	return this.substring(0, this.indexOf(before));
};

String.prototype.textBeforeLast = function (before) {
	return this.split("")
		.reverse()
		.join("")
		.textAfter(before)
		.split("")
		.reverse()
		.join("");
};

String.prototype.map = function (mappings) {
	let text = String(this);

	for (const replaced in mappings) {
		text = text.replaceAll(replaced, mappings[replaced]);
	}

	return text;
};

export default class ConstellationKernel {
	verboseBootUIInterval: number;

	// subsystems
	fs: FilesystemAPI;
	security: Security;
	runtime: apps.ProgramRuntime;

	constructor(
		rootPoint: string,
		isGraphical: boolean = false,
		logs: any[] = []
	) {
		const url = new URL(window.location.href);
		const params = url.searchParams;
		const bootScreenTest = params.get("bootscreenTest") == "true";

		// subsystems
		this.fs = new FilesystemAPI(rootPoint);
		this.security = new Security(this);
		this.runtime = new apps.ProgramRuntime(this);

		this.verboseBootUIInterval = setInterval(() => {
			const elem: HTMLParagraphElement =
				document.querySelector("p.bootText")!;

			if (elem !== null) {
				if (elem.innerText !== String(status)) {
					elem.innerText = String(status);
				}
			}
		});

		if (!bootScreenTest) {
			try {
				this.init();
			} catch (e) {
				panic(e, "systemMain");
			}
		}
	}

	async init() {
		await fsLoaded();

		//const firstBoot = (await fs.readFile("/System/arc.json")) == undefined;
		//if (firstBoot) {
		await installer.install(this);
		//}

		await this.fs.init();
		await this.security.init();
		await this.runtime.init();

		const bootBackground = document.querySelector("div.bootCover")!;
		bootBackground.classList.add("fadeOut");

		clearInterval(this.verboseBootUIInterval);

		setTimeout(() => bootBackground.remove(), 5000);

		const bootSound = await fs.readFile(
			"/System/CoreAssets/Sounds/boot/iMacG3.mp3"
		);
		const sound = new Audio(bootSound);
		try {
			sound.play();
		} catch {}
		sound.remove();

		const coreExecDirectory = "/System/CoreExecutables/CoreExecutable.backgr";

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
			console.warn(coreExecDirectory);
			const exec = await this.runtime.execute(
				coreExecDirectory,
				[],
				"system",
				systemPassword,
				undefined,
				false
			);
			console.warn(exec);
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

const kernel = new ConstellationKernel("/");
await kernel.init();

// @ts-expect-error
window.coreKernel = kernel;
