import { Process } from "./executables.js";
import * as executables from "./executables.js";

import fs from "../io/fs.js";
import * as uikit from "../lib/uiKit/uiKit.js";
import {
	focusedWindow,
	getWindowOfId,
	GraphicalWindow
} from "../windows/windows.js";

import { blobify, translateAllBlobURIsToDirectories } from "../lib/blobify.js";
import { AppInitialisationError, ImportError } from "../errors.js";
import ProcessWaitingObject from "./appWaitingObject.js";
import {
	ApplicationAuthorisationAPI,
	EnvironmentCreator
} from "../security/env.js";
import { rewriteImportsAsync } from "./importRewrites.js";
import { DevToolsColor, performanceLog } from "../lib/debug.js";
import { debug } from "../lib/logging.js";
import ConstellationKernel from "../main.js";

const name = "/System/apps.js";

export function AppsTimeStamp(
	label: string,
	start: DOMHighResTimeStamp,
	colour: DevToolsColor = "secondary"
) {
	performanceLog(label, start, "AppsRuntime", colour);
}

const appsStart = performance.now();

declare global {
	interface Window {
		renderID: number;
		Application: typeof executables.Application;
		BackgroundProcess: typeof executables.BackgroundProcess;
		Popup: typeof executables.Popup;
		Module: typeof executables.Module;
		processes: executables.Process[];
		env: ApplicationAuthorisationAPI;
		windows: GraphicalWindow[];
	}
}

export const processes: executables.Process[] = [];
window.processes = processes;

window.renderID = 0;

await uikit.init();

// allow processes to access this
window.Application = executables.Application;
window.BackgroundProcess = executables.BackgroundProcess;
window.Popup = executables.Popup;
window.Module = executables.Module;

// @ts-expect-error
window.env = {};
(window as any).env = window.env;

export function getProcessFromID(id: number) {
	for (const proc of processes) {
		if (proc.id == id) {
			return proc;
		}
	}
}

type executionFiletype = "js";

let popupDirectory = "/System/CoreExecutables/Popup.appl";

/**
 * Removes a process from execution
 * @param proc - the Process object of the target to terminate.
 * @param isDueToCrash - whether this is from a crash - true means the process' terminate function is not called.
 */
export async function terminate(proc: Process, isDueToCrash: Boolean = false) {
	const start = performance.now();
	const procDir = String(proc.directory);

	const idx = processes.indexOf(proc);

	if (!isDueToCrash) {
		try {
			await proc.terminate();
		} catch {}
	}

	if (proc instanceof Application) {
		try {
			proc?.renderer?.terminate();
		} catch {}
	}

	for (const process of processes) {
		if (process.children instanceof Array)
			process.children = process.children.filter(
				(child) => child !== proc
			);
	}

	if (proc.data == null) {
		// insure the respective AppWaitingObject can resolve itself.
		proc.data = undefined;
	}

	processes.splice(idx, 1);

	AppsTimeStamp(`Terminate process ${procDir}`, start);
}

const activeIterators = new WeakMap<
	Process,
	Iterator<any> | AsyncIterator<any>
>();

export function appName(proc: executables.Framework) {
	// @ts-expect-error
	if (proc.name !== undefined) return proc.name;

	// @ts-expect-error
	const windowName = proc?.renderer?.window?.name;

	if (windowName !== undefined && windowName !== proc.directory)
		return windowName;

	const constructorName = Object.getPrototypeOf(proc).constructor.name;

	return constructorName;
}

document.addEventListener("keydown", (event) => {
	//event.preventDefault()

	const keylisteners = new Set([
		getWindowOfId(focusedWindow)?.Application,
		...processes.filter((proc) => proc.env.hasPermission("keylogger"))
	]);

	const procKeydown = (proc?: Process) => {
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
	};

	keylisteners.forEach((item) => procKeydown(item));
});
document.addEventListener("keyup", (event) => {
	//event.preventDefault()

	const keylisteners = [
		getWindowOfId(focusedWindow)?.Application,
		...processes.filter((proc) => proc.env.hasPermission("keylogger"))
	];

	const procKeyup = (proc?: Process) => {
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
	};

	keylisteners.forEach((item) => procKeyup(item));
});

export class ProgramRuntime {
	EnvironmentCreator: EnvironmentCreator;
	associations: Record<string, Process["id"]> = {};

	constructor(
		public ConstellationKernel: ConstellationKernel,
		public isGraphical = false
	) {
		this.EnvironmentCreator = this.ConstellationKernel.security.env;
	}

	async init() {
		const startEnvInit = performance.now();
		debug(name, "Apps initialising.");

		window.env = new ApplicationAuthorisationAPI(
			this.EnvironmentCreator,
			"/System/globalPermissionsHost.js",
			"guest",
			"",
			undefined,
			true
		);
		(window as any).env = window.env;

		debug(name, "Apps initialised.");
		AppsTimeStamp("Creation of global env", startEnvInit);
	}

	frame() {
		const start = performance.now();

		for (const pid in processes) {
			const process = processes[pid];

			this.procExec(process);
		}

		AppsTimeStamp("Processes frame", start);
	}

	/**
	 *
	 * @param directory - Directory of the root of the application to execute from
	 * @param args - Arguements to be passed to the process
	 * @param isPackage - Whether this file is in a 'package'.
	 * @returns an Object containing a promise with the Process Waiting object - this promise will resolve when the process exits, and return the value the process exited with.
	 */
	async execute(
		directory: string,
		args: any[] = [],
		user: string,
		password: string,
		parent?: Process,
		waitForInit: boolean = true
	): Promise<{
		promise: Promise<any>;
	}> {
		const start = performance.now();

		console.debug("Executing program from " + directory);

		/**
		 * Reads a file from an application package
		 * @param dir - Relative directory of the file from the app's base
		 * @param throwIfEmpty - Whether to throw an error if the file is empty.
		 * @returns Contents of the file OR an error if the file isn't present and throwIfEmpty is true (default)
		 */
		const get = async (
			dir: string,
			throwIfEmpty: Boolean = true
		): Promise<string> => {
			const rel = fs.resolve(directory, dir);

			const content = await fs.readFile(rel);

			if (content == undefined) {
				if (throwIfEmpty) {
					throw new Error(rel + " is empty!");
				} else {
					return "";
				}
			}

			return content;
		};

		// get the app config
		const configSrc = await get("config.js");
		const configBlob = await blobify(configSrc, "text/javascript");
		const config = (await import(configBlob)).default;

		if (config.allowMultipleInstances == false) {
			for (const process of processes) {
				if (process.directory == directory) {
					throw new Error(
						"This application may not run more than once."
					);
				}
			}
		}

		const allowedExtensions: executionFiletype[] = ["js"];

		let executableDirectory: string | undefined;
		let type: executionFiletype | undefined;
		const tcpsys = await fs.readdir(fs.resolve(directory, "tcpsys"));

		// get the script
		for (const ext of allowedExtensions) {
			if (tcpsys.includes("app." + ext)) {
				executableDirectory = fs.resolve(
					directory,
					"tcpsys/app." + ext
				);
				type = ext;
				break;
			}
		}

		if (executableDirectory == undefined)
			throw new Error("No Executable found.");

		let data: string = "";

		switch (type) {
			case "js":
				{
					const content = await fs.readFile(executableDirectory);

					if (content == undefined) {
						throw new AppInitialisationError(
							fs.resolve(directory, "tcpsys/app.[js / sjs]") +
								" is empty and cannot be executed"
						);
					}

					const importsResolved = await rewriteImportsAsync(
						content,
						executableDirectory
					);

					data = importsResolved;
				}
				break;
			default:
				throw new AppInitialisationError(
					"Type '" + type + "' is not executable."
				);
		}

		// create a blob of the content
		const blob = blobify(data, "text/javascript");

		// import from the script BLOB
		const exports = await import(blob);

		// get the class constructor
		const Executable: typeof Process = exports.default;

		// create the process
		const live = new Executable(
			this.ConstellationKernel,
			directory,
			args,
			user,
			password
		);
		try {
			await live.validateCredentials(
				this.ConstellationKernel,
				user,
				password
			);
		} catch (e: any) {
			const error = new AppInitialisationError("error");
			error.message = e.message;
			error.stack = e.stack;
			throw error;
		}

		if (parent?.children !== undefined) parent.children.push(live);

		// add to the processes list
		processes.push(live);

		if (waitForInit) {
			await this.procExec(live, "init");
		} else {
			// not waiting for anybody.
			this.procExec(live, "init");
		}

		AppsTimeStamp(`Open program from ${directory}`, start);

		return {
			promise: ProcessWaitingObject(live) as Promise<Exclude<any, null>>
		};
	}

	async showPrompt(
		type: "error" | "warning" | "log",
		title: string,
		description?: any,
		buttons?: String[]
	) {
		const popup = await fs.readFile(popupDirectory + "/config.js");

		if (popup == undefined) {
			throw new Error(
				"Popupapp at " + popupDirectory + " does not exist?"
			);
		} else {
			const pipe: any[] = [];
			await this.execute(
				popupDirectory,
				[type, title, title, description, buttons, pipe],
				"guest",
				""
			);

			if (buttons !== undefined) {
				return await new Promise((resolve: Function) => {
					let interval = setInterval(() => {
						for (const _ in pipe) {
							_;
							const msg = pipe[0];

							if (typeof msg == "object") {
								switch (msg.intent) {
									case "popupResult":
										// we can exit now
										clearInterval(interval);
										resolve(msg.data);
										return;
								}
							}

							pipe.splice(0, 1);
						}
					});
				});
			} else {
				return;
			}
		}
	}

	async procExec(
		process: Process,
		subset: "init" | "frame" | "terminate" = "frame",
		catchError: boolean = true
	) {
		if (process.executing) return;

		try {
			process.executing = true;

			let iter = activeIterators.get(process);

			if (!iter) {
				const result = process[subset]();
				// @ts-expect-error
				if (result && typeof result.next === "function") {
					// @ts-expect-error
					iter = result;
					// @ts-expect-error
					activeIterators.set(process, iter);
				} else {
					// normal function
					await result;
					process.executing = false;
					return;
				}
			}

			// @ts-expect-error
			const { done } = await iter.next();

			if (done) {
				activeIterators.delete(process);
			}

			process.executing = false;
		} catch (e: any) {
			process.executing = false;
			console.warn(e);

			if (!catchError) return;

			const name = appName(process);

			await terminate(process);

			const choice = await this.ConstellationKernel.runtime.showPrompt(
				"warning",
				`${name} quit unexpectedly.`,
				translateAllBlobURIsToDirectories(e.stack),
				["Ignore", "Report..."]
			);

			switch (choice) {
				case "Report...":
					console.log("we need to report thissss....");
					break;
			}
		}
	}
}

AppsTimeStamp("Startup of src/apps/apps.js", appsStart, "primary");
