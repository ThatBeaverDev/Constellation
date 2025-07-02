import conf from "../constellation.config.js";
import { Application, BackgroundProcess, Process } from "./executables.js";
import fs from "../fs.js";
import * as uikit from "../lib/uiKit/uiKit.js";
import { blobify } from "../lib/blobify.js";
import * as env from "./api.js";
import { focus, windows } from "../windows/windows.js";
import { AppInitialisationError, ImportError } from "../errors.js";

(globalThis as any).env = env;

declare global {
	interface Window {
		renderID: number;
		Application: new (directory: string, args: any[]) => Application;
		BackgroundProcess: new (
			directory: string,
			args: any[]
		) => BackgroundProcess;
		sysimport: any;
		processes: Process[];
		env: typeof env;
		windows: Window[];
	}
}
window.env = env;
(window as any).env = window.env;

export const processes: Process[] = [];
window.processes = processes;

window.renderID = 0;

await uikit.init();

// allow processes to access this
window.Application = Application;
window.BackgroundProcess = BackgroundProcess;

type executionFiletype = "sjs" | "js";

export async function execute(directory: string, args: any[] = []) {
	const get = async (dir: string) => {
		const rel = fs.relative(directory, dir);

		return await fs.readFile(rel);
	};

	// get the app config
	const configSrc = await get("config.js");
	const configBlob = blobify(configSrc, "text/javascript");
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

	try {
		live.executing = true;
		await live.init();
		live.executing = false;
	} catch (e) {
		showPrompt(
			"error",
			"Application Error" +
				(live.renderer.window.name || live.directory) +
				" has crashed.",
			e
		);

		await terminate(live);
	}
}

export async function showPrompt(
	type: "error" | "warning" | "log",
	title: string,
	description?: any
) {
	const popup = await env.fs.readFile(popupDirectory + "/config.js");

	if (popup.data !== undefined) {
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

let popupDirectory = "/System/CoreExecutables/com.constellation.popup";

async function procExec(proc: Process) {
	try {
		if (proc.executing == true) {
			return;
		}

		proc.executing = true;
		await proc.frame();
		proc.executing = false;
	} catch (e) {
		console.error(e);
		const popup = await env.fs.readFile(popupDirectory + "/config.js");

		if (popup.data !== undefined) {
			await execute(popupDirectory, [
				"error",
				"Application Error",
				"Application at " + proc.directory + " has crashed.",
				e
			]);
		}

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
			// @ts-expect-error
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
			// @ts-expect-error
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
