import conf from "../constellation.config.js";
import { Application, BackgroundProcess, Process } from "./executables.js";
import fs from "../fs.js";
import * as uikit from "../lib/uiKit/uiKit.js";
import { blobify } from "../lib/blobify.js";
import * as env from "./api.js";
import { focus, windows } from "../windows.js";
import { AppInitialisationError, ImportError } from "../errors.js";

declare global {
	interface Window {
		renderID: number;
		Application: any;
		BackgroundProcess: any;
		sysimport: any;
		processes: Process[];
		env: Object;
		windows: Window[];
	}
}
window.env = env;

export const processes: Process[] = [];
window.processes = processes;

window.renderID = 0;

await uikit.init();

// allow processes to access this
window.Application = Application;
window.BackgroundProcess = BackgroundProcess;


export async function execute(directory: string) {
	const get = async (dir: string) => {
		const rel = fs.relative(directory, dir);

		return await fs.readFile(rel);
	};

	// get the app config
	const configSrc = await get("config.js");
	const configBlob = blobify(configSrc, "text/javascript");
	const config = (await import(configBlob)).default;

	// get the script
	const content = await get("tcpsys/app.sjs");

	if (content == undefined) {
		throw new AppInitialisationError(
			fs.relative(directory, "tcpsys/app.[execType]") + " is empty and cannot be executed"
		);
	}

	const data = content; // use replaceAll to overrite things if needed.

	// create a blob of the content
	const blob = blobify(data, "text/javascript");

	// import from the script BLOB
	const exports = await import(blob);

	// get the constructor
	const Application = exports.default;

	// create the process
	const live = new Application(directory);

	// add to the processes list
	processes.push(live);

	await live.init();
}

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
		// do something? not sure what yet.
	}
}

document.addEventListener("keydown", (event) => {
	//event.preventDefault()

	const proc = windows[focus].Application;

	// @ts-expect-error
	proc.keydown(event.code, event.metaKey, event.altKey, event.ctrlKey, event.shiftKey, event.repeat);

	for (const proc of processes) {
		if (proc instanceof BackgroundProcess) {
			proc.keydown(event.code, event.metaKey, event.altKey, event.ctrlKey, event.shiftKey, event.repeat);
		}
	}
});
document.addEventListener("keyup", (event) => {
	//event.preventDefault()

	const proc = windows[focus]?.Application;

	if (proc == undefined) {
		return;
	}

	// @ts-expect-error
	proc.keyup(event.code, event.metaKey, event.altKey, event.ctrlKey, event.shiftKey, event.repeat);

	for (const proc of processes) {
		if (proc instanceof BackgroundProcess) {
			proc.keyup(event.code, event.metaKey, event.altKey, event.ctrlKey, event.shiftKey, event.repeat);
		}
	}
});

export function run() {
	for (const pid in processes) {
		const process = processes[pid];

		procExec(process);
	}
}
