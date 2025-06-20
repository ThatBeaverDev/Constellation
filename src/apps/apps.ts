import conf from "../constellation.config.js";
import { Application, BackgroundProcess, Process } from "./processes.js";
import fs from "../fs.js";
import * as uikit from "../lib/uiKit/uiKit.js";

declare global {
	interface Window {
		renderID: number;
		Application: any;
		BackgroundProcess: any;
		sysimport: any;
		processes: Process[];
	}
}

export const processes: Process[] = [];
window.processes = processes;

window.renderID = 0;

await uikit.init();

// allow processes to access this
window.Application = Application;
window.BackgroundProcess = BackgroundProcess;

function blobify(text: string, mime = "text/plain") {
	const blob = new Blob([text], {
		type: mime
	});
	const location = URL.createObjectURL(blob);

	return location;
}

window.sysimport = async function (directory: string) {
	let url;
	// @ts-ignore // no idea why these throw errors?
	if (conf.importOverrides[directory] !== undefined) {
		// @ts-ignore
		url = conf.importOverrides[directory];
	} else {
		const content = await fs.readFile(directory);

		if (content == undefined) {
			throw new Error("Import source is empty!");
		}

		url = blobify(content, "text/javascript");
	}

	const exports = await import(url);

	return exports;
};

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
		throw new Error(fs.relative(directory, "tcpsys/app.sjs") + " is empty and cannot be executed");
	}

	const data = content.replaceAll("import(", "sysimport(");

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

	if (event.repeat) {
		return;
	}

	for (const pid in processes) {
		const process = processes[pid];

		process.keydown(event.code, event.metaKey, event.altKey, event.ctrlKey);
	}
});
document.addEventListener("keyup", (event) => {
	//event.preventDefault()

	if (event.repeat) {
		return;
	}

	for (const pid in processes) {
		const process = processes[pid];

		process.keyup(event.code, event.metaKey, event.altKey, event.ctrlKey);
	}
});

export function run() {
	for (const pid in processes) {
		const process = processes[pid];

		procExec(process);
	}
}
