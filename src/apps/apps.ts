import * as conf from "../constellation.config.js";

import { Process } from "./executables.js";
import * as executables from "./executables.js";

import fs from "../io/fs.js";
import * as uikit from "../lib/uiKit/uiKit.js";
import { blobify, translateAllBlobURIsToDirectories } from "../lib/blobify.js";
import { focus, windows } from "../windows/windows.js";
import { AppInitialisationError, ImportError } from "../errors.js";
import AppWaitingObject from "./appWaitingObject.js";
import { ApplicationAuthorisationAPI } from "./api.js";
import { defaultUser } from "./users.js";

declare global {
	interface Window {
		renderID: number;
		Application: new (
			directory: string,
			args: any[]
		) => executables.Application;
		BackgroundProcess: new (
			directory: string,
			args: any[]
		) => executables.BackgroundProcess;
		Popup: new (directory: string, args: any[]) => executables.Popup;
		Module: new (directory: string, args: any[]) => executables.Module;
		sysimport: any;
		processes: executables.Process[];
		env: ApplicationAuthorisationAPI;
		windows: Window[];
	}
}
window.env = new ApplicationAuthorisationAPI(
	"/System/globalPermissionsHost.js",
	defaultUser
);
(window as any).env = window.env;

export const processes: executables.Process[] = [];
window.processes = processes;

window.renderID = 0;

await uikit.init();

// allow processes to access this
window.Application = executables.Application;
window.BackgroundProcess = executables.BackgroundProcess;
window.Popup = executables.Popup;
window.Module = executables.Module;

export function getProcessFromID(id: number) {
	for (const proc of processes) {
		if (proc.id == id) {
			return proc;
		}
	}
}

type executionFiletype = "sjs" | "js";

export async function execute(directory: string, args: any[] = []) {
	const get = async (dir: string, throwIfEmpty: Boolean = true) => {
		const rel = fs.relative(directory, dir);

		const content = await fs.readFile(rel);

		if (throwIfEmpty && content == undefined) {
			throw new Error(rel + " is empty!");
		}

		return content;
	};

	// get the app config
	const configSrc = await get("config.js");
	const configBlob = await blobify(configSrc, "text/javascript");
	const config = (await import(configBlob)).default;

	const allowedExtensions: executionFiletype[] = ["sjs", "js"];

	let executableDirectory: string | undefined;
	let type: executionFiletype | undefined;
	const tcpsys = await fs.readdir(fs.relative(directory, "tcpsys"));

	// get the script
	for (const ext of allowedExtensions) {
		if (tcpsys.includes("app." + ext)) {
			executableDirectory = fs.relative(directory, "tcpsys/app." + ext);
			type = ext;
			break;
		}
	}

	let data: string = "";

	switch (type) {
		case "js":
		case "sjs":
			{
				const content = await fs.readFile(executableDirectory);

				if (content == undefined) {
					throw new AppInitialisationError(
						fs.relative(directory, "tcpsys/app.[js / sjs]") +
							" is empty and cannot be executed"
					);
				}

				data = content;
			}
			break;
		default:
			throw new AppInitialisationError(
				"Type '" + type + "' is not recognised."
			);
	}

	// create a blob of the content
	const blob = blobify(data, "text/javascript");

	// import from the script BLOB
	const exports = await import(blob);

	// get the constructor
	const Application = exports.default;

	// create the process
	const live = new Application(directory, args);

	// add to the processes list
	processes.push(live);

	await procExec(live, "init");

	return {
		promise: AppWaitingObject(live)
	};
}

let popupDirectory = "/System/CoreExecutables/Popup.appl";
export async function showPrompt(
	type: "error" | "warning" | "log",
	title: string,
	description?: any
) {
	const popup = await env.fs.readFile(popupDirectory + "/config.js");

	if (popup.data == undefined) {
		throw new Error("Popupapp at " + popupDirectory + " does not exist?");
	} else {
		await execute(popupDirectory, [type, title, title, description]);
	}
}

export async function terminate(proc: Process, isDueToCrash: Boolean = false) {
	const idx = processes.indexOf(proc);

	if (!isDueToCrash) {
		try {
			await proc.terminate();
		} catch {}
	}

	// @ts-expect-error
	if (proc.renderer !== undefined) {
		// @ts-expect-error
		proc.renderer.window.remove();
	}

	processes.splice(idx, 1);
}

const activeIterators = new WeakMap<
	Process,
	Iterator<any> | AsyncIterator<any>
>();

async function procExec(
	proc: Process,
	subset: "init" | "frame" | "terminate" = "frame"
) {
	if (proc.executing) return;

	try {
		proc.executing = true;

		let iter = activeIterators.get(proc);

		if (!iter) {
			const result = proc[subset]();
			// @ts-expect-error
			if (result && typeof result.next === "function") {
				// @ts-expect-error
				iter = result;
				// @ts-expect-error
				activeIterators.set(proc, iter);
			} else {
				// normal function
				await result;
				proc.executing = false;
				return;
			}
		}

		// @ts-expect-error
		const { done } = await iter.next();

		if (done) {
			activeIterators.delete(proc);
		}

		proc.executing = false;
	} catch (e: any) {
		proc.executing = false;
		console.warn(e);

		const name =
			proc?.name ||
			// @ts-expect-error
			proc?.renderer?.window?.name ||
			Object.getPrototypeOf(proc).constructor.name ||
			proc?.directory;

		showPrompt(
			"warning",
			`${name} quit unexpectedly.`,
			translateAllBlobURIsToDirectories(e.stack)
		);

		await terminate(proc);
	}
}

document.addEventListener("keydown", (event) => {
	//event.preventDefault()

	const proc = windows[focus]?.Application;
	if (proc == undefined) return;

	const fnc = proc.keydown;

	if (typeof fnc == "function") {
		fnc.call(
			proc,
			event.code,
			event.metaKey,
			event.altKey,
			event.ctrlKey,
			event.shiftKey,
			event.repeat
		);
	}

	for (const proc of processes) {
		if (proc instanceof BackgroundProcess) {
			const fnc = proc.keydown;

			if (typeof fnc == "function") {
				fnc.call(
					proc,
					event.code,
					event.metaKey,
					event.altKey,
					event.ctrlKey,
					event.shiftKey,
					event.repeat
				);
			}
		}
	}
});
document.addEventListener("keyup", (event) => {
	//event.preventDefault()

	const proc = windows[focus]?.Application;
	if (proc == undefined) return;

	const fnc = proc.keyup;

	if (typeof fnc == "function") {
		fnc.call(
			proc,
			event.code,
			event.metaKey,
			event.altKey,
			event.ctrlKey,
			event.shiftKey,
			event.repeat
		);
	}

	for (const proc of processes) {
		if (proc instanceof BackgroundProcess) {
			const fnc = proc.keyup;

			if (typeof fnc == "function") {
				fnc.call(
					proc,
					event.code,
					event.metaKey,
					event.altKey,
					event.ctrlKey,
					event.shiftKey,
					event.repeat
				);
			}
		}
	}
});

declare global {
	interface Window {
		profileNextFrame: Boolean;
	}
}

declare global {
	interface Console {
		profile: Function;
		profileEnd: Function;
	}
}

window.profileNextFrame = false;

export function run() {
	if (window.profileNextFrame) {
		console.profile("tick");
	}

	for (const pid in processes) {
		const process = processes[pid];

		procExec(process);
	}

	if (window.profileNextFrame) {
		console.profileEnd("tick");

		window.profileNextFrame = false;
	}
}
