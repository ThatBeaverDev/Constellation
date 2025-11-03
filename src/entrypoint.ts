#! /usr/bin/env node

import { isCommandLine, isNode } from "./system/getPlatform.js";
import applyStringPrototypes from "./system/stringPrototypes.js";
import ConstellationKernel from "./system/kernel.js";
import Blobifier from "./system/lib/blobify.js";
import ImportResolver from "./system/runtime/components/resolver.js";
import { getFlagValue } from "./system/lib/flags.js";

applyStringPrototypes();

const { FilesystemAPI } = await import("./fs/fs.js");

if (isNode) {
	console.log(
		"NodeJS is not supported at this time since it doesn't implement dynamic import from BLOB URIs,\nsomething constellation heavily depends on. We'd recommend using Deno. Sorry!"
	);
	process.exit();
}

// allow `declare global`.
export {};

if (isCommandLine) {
	// this is node(like), we need `window` to be valid to proceed.
	// @ts-expect-error
	global.window = global;

	(globalThis as any).location = {
		hash: "",
		host: "localhost:5174",
		hostname: "localhost",
		href: "https://localhost:5174",
		origin: "https://localhost:5174",
		pathname: "/",
		port: "5174",
		protocol: "https:",
		search: "",
		toString() {
			return "https://localhost:5174";
		}
	};

	// we now need to insure we're in the right directory, else system installaton will fail.
	const entrypoint = process.argv[1];

	const entrypointParent = entrypoint.textBeforeLast("/");
	const projectRoot = entrypointParent.textBeforeLast("/");

	process.chdir(projectRoot);
}

const isDevmode = Boolean(getFlagValue("dev"));

function getRequiredLibraries(root: string) {
	const fsApi = new FilesystemAPI(root);
	const blobifier = new Blobifier(fsApi);
	const processor = new ImportResolver(fsApi, blobifier);

	return {
		fsApi,
		processor,
		blobifier
	};
}

/**
 * Starts a kernel from a location. runs from web and installs if needed.
 */
async function startupKernel(root: string, canInstall: boolean = true) {
	console.debug("Starting kernel at ", root);

	// get the needed libraries
	const { fsApi, processor } = getRequiredLibraries(root);

	// wait for the installation index if it's a promise
	if (installationIndexFile instanceof Promise) {
		console.log(
			"Waiting for the user to complete installation file selection."
		);
		installationIndexFile = await installationIndexFile;
	}

	// remove keydown event listener
	if (!isCommandLine) {
		document.removeEventListener("keydown", detectKeyPresses);
	}

	/* -------------------- Function to check whether an install is required -------------------- */

	async function checkWhetherInstallIsRequired(): Promise<boolean> {
		if (canInstall == false) return false;

		if (Boolean(getFlagValue("forceInstall"))) {
			return true;
		}

		const kernelExists =
			(await fsApi.readFile("/System/kernel.js")) !== undefined;

		if (kernelExists) return false;

		return true;
	}

	// check if install is needed
	const installIsNeeded = await checkWhetherInstallIsRequired();

	let Kernel: typeof ConstellationKernel;

	/* -------------------- Grabbing Kernel constructor -------------------- */

	// get the contructor
	if (installIsNeeded) {
		Kernel = (await import("./system/kernel.js")).default;
	} else {
		// read kernel
		const contents = await fsApi.readFile("/System/kernel.js");
		if (contents == undefined) {
			throw new Error(
				"Kernel has become undefined during initialisation."
			);
		}

		// process and resolve imports
		const blobURL = await processor.resolve("/System/kernel.js");

		// set the variable
		Kernel = (await import(blobURL)).default;
	}

	/* -------------------- Devmode features -------------------- */

	if (isDevmode) {
		// add constructor to window if devmode
		(globalThis as any).Kernel = Kernel;
	}

	/* -------------------- Check for GUI environment -------------------- */

	// check if the environment is graphical or not
	let isGraphical = true;
	if (typeof window.document == "undefined" || appliedBootKey == "tuiMode") {
		/* Only boot graphical if in a browser or user requested it, else use console mode */
		isGraphical = false;
	}

	/* -------------------- Start the Kernel -------------------- */

	const logs: any[] = [];
	const currentKernel = new Kernel(root, isGraphical, logs, fsApi, {
		installationIdx: installationIndexFile,
		install: installIsNeeded
	});

	/* -------------------- Start actual Kernel if the last one was an installer once it exits -------------------- */

	if (installIsNeeded) {
		await new Promise((resolve: Function) => {
			let interval = setInterval(() => {
				if (currentKernel.isTerminated) {
					clearInterval(interval);
					resolve();
					return;
				}
			}, 2);
		});

		await startupKernel(root, false);
	}
}

/* -------------------- BootKeys -------------------- */

// Listen for keys in the 1s of kernel time to know whether to boot into either safe mode (TODO) or TUI mode.

const bootKeys = {
	tuiMode:
		"Boots the system into TUI mode, which is the default for command line programs.",
	guiMode:
		"Boots the system into GUI mode, which is the default for browsers. will crash on CLI.",
	safeMode:
		"Boots the system into safe mode, wherein only authorised programs can run."
};
type bootkey = keyof typeof bootKeys;

let appliedBootKey: bootkey | undefined = undefined;
let installationIndexFile: any = undefined;

if (!isCommandLine) {
	if (getFlagValue("tuiMode")) {
		appliedBootKey = "tuiMode";
	} else {
		document.addEventListener("keydown", detectKeyPresses);
	}
}

function detectKeyPresses(event: KeyboardEvent) {
	if (appliedBootKey !== undefined) return;

	const key = event.code;

	switch (key) {
		case "KeyS":
			// TODO: implement safe mode
			appliedBootKey = "safeMode";
			break;
		case "KeyT":
			appliedBootKey = "tuiMode";
			break;
		case "KeyG":
			appliedBootKey = "guiMode";
			break;
		case "KeyF":
			installationIndexFile = new Promise((resolve: Function) => {
				const input = document.createElement("input");
				input.type = "file";
				input.accept = ".idx";

				input.addEventListener("change", async () => {
					if (input.files == null) return;

					if (input.files.length === 1) {
						const file = input.files[0];
						const contents = await file.text();
						const object = JSON.parse(contents);

						resolve(object);
					}
				});

				input.click();
			});

			break;
	}
}

// wait while keypresses are recieved
setTimeout(() => {
	startupKernel("/");
}, 1000);
