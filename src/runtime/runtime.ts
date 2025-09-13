import { Process } from "./executables.js";
import * as executables from "./executables.js";

import { AppInitialisationError } from "../errors.js";
import ProcessWaitingObject from "./appWaitingObject.js";
import {
	ApplicationAuthorisationAPI,
	EnvironmentCreator
} from "../security/env.js";
import { DevToolsColor, performanceLog } from "../lib/debug.js";
import ConstellationKernel from "../kernel.js";
import { importRewriter } from "./codeProcessor.js";
import { dump } from "./crashed.js";

const path = "/System/runtime.js";

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
		env: ApplicationAuthorisationAPI;
	}
}

export interface ProcessInformation {
	// attachment info
	id: number;
	counter: number;
	kernel: ConstellationKernel;

	// origination
	directory: string;
	startTime: number;

	// state
	program: Process;
	children: Process[];
}

export const processes: ProcessInformation[] = [];
(window as any).processes = processes;

window.renderID = 0;

// allow processes to access this
window.Application = executables.Application;
window.BackgroundProcess = executables.BackgroundProcess;
window.Popup = executables.Popup;
window.Module = executables.Module;

export function getProcessFromID(id: number): Process | undefined {
	for (const proc of processes) {
		if (proc.id == id) {
			return proc.program;
		}
	}
}

type executionFiletype = "js";
export type executionResult = {
	promise: Promise<any>;
};

let popupDirectory = "/System/CoreExecutables/Popup.appl";

/**
 * Removes a process from execution
 * @param proc - the Process object of the target to terminate.
 * @param isDueToCrash - whether this is from a crash - true means the process' terminate function is not called.
 */
export async function terminate(proc: Process, isDueToCrash: Boolean = false) {
	const start = performance.now();
	const procDir = String(proc.directory);

	const idx = processes.map((item) => item.program).indexOf(proc);

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

declare global {
	interface Window {
		envs: Map<ProgramRuntime["id"], ApplicationAuthorisationAPI>;
	}
}
window.envs = new Map();

let nextProgramRuntimeId = 0;
export class ProgramRuntime {
	EnvironmentCreator: EnvironmentCreator;
	associations: Record<string, Process["id"]> = {};
	id: number = nextProgramRuntimeId++;
	#ConstellationKernel: ConstellationKernel;

	constructor(
		ConstellationKernel: ConstellationKernel,
		public isGraphical = false
	) {
		this.#ConstellationKernel = ConstellationKernel;
		this.EnvironmentCreator = this.#ConstellationKernel.security.env;
		this.importsRewriter = new importRewriter(
			this.#ConstellationKernel.fs,
			this
		);
	}

	async init() {
		const startEnvInit = performance.now();
		this.#ConstellationKernel.lib.logging.debug(path, "Apps initialising.");

		const env = new ApplicationAuthorisationAPI(
			this.#ConstellationKernel,
			this.EnvironmentCreator,
			"/System/globalPermissionsHost.js",
			"guest",
			"",
			undefined,
			true
		);
		window.envs.set(this.id, env);

		if (this.#ConstellationKernel.isGraphical)
			document.addEventListener("keydown", (event) => {
				const UserInterface =
					this.#ConstellationKernel.GraphicalInterface;
				if (UserInterface == undefined) return;

				const keylisteners = new Set([
					UserInterface.windows.getWindowOfId(
						UserInterface.windows.focusedWindow
					)?.Application,
					...processes.filter((proc) =>
						proc.program.env.hasPermission("keylogger")
					)
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

				keylisteners.forEach((item) => {
					if (item instanceof Process) {
						procKeydown(item);
					} else {
						procKeydown(item?.program);
					}
				});

				document.addEventListener("keyup", (event) => {
					const UserInterface =
						this.#ConstellationKernel.GraphicalInterface;
					if (UserInterface == undefined) return;

					const keylisteners = [
						UserInterface.windows.getWindowOfId(
							UserInterface.windows.focusedWindow
						)?.Application,
						...processes.filter((proc) =>
							proc.program.env.hasPermission("keylogger")
						)
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

					keylisteners.forEach((item) => {
						if (item instanceof Process) {
							procKeyup(item);
						} else {
							procKeyup(item?.program);
						}
					});
				});
			});

		this.#ConstellationKernel.lib.logging.debug(path, "Apps initialised.");
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
	): Promise<executionResult> {
		const start = performance.now();

		this.#ConstellationKernel.lib.logging.debug(
			path,
			"Executing program from " + directory
		);

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
			const rel = this.#ConstellationKernel.fs.resolve(directory, dir);

			const content = await this.#ConstellationKernel.fs.readFile(rel);

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
		const configBlob =
			await this.#ConstellationKernel.lib.blobifier.blobify(
				configSrc,
				"text/javascript"
			);
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
		const tcpsys = await this.#ConstellationKernel.fs.readdir(
			this.#ConstellationKernel.fs.resolve(directory, "tcpsys")
		);

		// get the script
		for (const ext of allowedExtensions) {
			if (tcpsys.includes("app." + ext)) {
				executableDirectory = this.#ConstellationKernel.fs.resolve(
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
					const content =
						await this.#ConstellationKernel.fs.readFile(
							executableDirectory
						);

					if (content == undefined) {
						throw new AppInitialisationError(
							this.#ConstellationKernel.fs.resolve(
								directory,
								"tcpsys/app.js"
							) + " is empty and cannot be executed"
						);
					}

					const importsResolved =
						await this.importsRewriter.processCode(
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
		const blob = this.#ConstellationKernel.lib.blobifier.blobify(
			data,
			"text/javascript"
		);

		// import from the script BLOB
		const exports = await import(blob);

		const { gui, tui, backgr } = exports;

		// get the class executable
		let Executable: typeof Process;
		if (
			this.#ConstellationKernel.GraphicalInterface !== undefined &&
			typeof gui == "function"
		) {
			// Graphical executable
			// log it
			this.#ConstellationKernel.lib.logging.debug(
				path,
				`Executable at ${directory} in initialisation is using Graphical entrypoint.`
			);

			// assign it
			Executable = gui;
		} else if (
			this.#ConstellationKernel.TextInterface !== undefined &&
			typeof tui == "function"
		) {
			// Text based executable
			// log it
			this.#ConstellationKernel.lib.logging.debug(
				path,
				`Executable at ${directory} in initialisation is using Text-based entrypoint.`
			);

			// assign it
			Executable = tui;
		} else if (typeof backgr == "function") {
			// Background executable
			// log it
			this.#ConstellationKernel.lib.logging.debug(
				path,
				`Executable at ${directory} in initialisation is using Text-based entrypoint.`
			);

			// assign it
			Executable = backgr;
		} else if (typeof exports.default == "function") {
			// any old executable
			// log it
			this.#ConstellationKernel.lib.logging.debug(
				path,
				`Executable at ${directory} in initialisation is using Text-based entrypoint.`
			);

			// assign it
			Executable = exports.default;
		} else {
			// nothing found.

			this.#ConstellationKernel.lib.logging.error(
				path,
				`Executable at ${directory} in initialisation has no supported entrypont.`
			);
			throw new Error(
				`Executable at ${directory} in initialisation has no supported entrypont.`
			);
		}

		// create the process
		const live = new Executable(
			this.#ConstellationKernel,
			directory,
			args,
			user,
			password
		);
		try {
			await live.validateCredentials(
				this.#ConstellationKernel,
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

		const info: ProcessInformation = {
			id: Number(executables.nextPID),
			counter: 0,
			kernel: this.#ConstellationKernel,
			directory,
			startTime: Date.now(),
			program: live,
			children: []
		};

		// add to the processes list
		processes.push(info);

		if (waitForInit) {
			await this.procExec(info, "init");
		} else {
			// not waiting for anybody.
			this.procExec(info, "init");
		}

		AppsTimeStamp(`Open program from ${directory}`, start);

		return {
			promise: ProcessWaitingObject(live) as Promise<Exclude<any, null>>
		};
	}

	importsRewriter: importRewriter;

	async showPrompt(
		type: "error" | "warning" | "log",
		title: string,
		description?: any,
		buttons?: String[]
	) {
		const popup = await this.#ConstellationKernel.fs.readFile(
			popupDirectory + "/config.js"
		);

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
		info: ProcessInformation,
		subset: "init" | "frame" | "terminate" = "frame",
		catchError: boolean = true
	) {
		const process = info.program;

		// insure readonly properties are still the same
		(process as any).id = Number(info.id);
		(process as any).directory = String(info.directory);
		(process as any).startTime = Number(info.startTime);

		if (process.executing) return;

		info.counter++;

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
			this.#ConstellationKernel.lib.logging.warn(path, e);

			if (!catchError) return;

			await dump(this.#ConstellationKernel, info);

			const name = appName(process);

			await terminate(process);

			const choice = await this.#ConstellationKernel.runtime.showPrompt(
				"warning",
				`${name} quit unexpectedly.`,
				this.#ConstellationKernel.lib.blobifier.translateAllBlobURIsToDirectories(
					e.stack
				),
				["Ignore", "Report..."]
			);

			switch (choice) {
				case "Report...":
					// TODO: report the error???
					this.#ConstellationKernel.lib.logging.log(
						path,
						"we need to report thissss...."
					);
					break;
			}
		}
	}
}

AppsTimeStamp("Startup of src/apps/apps.js", appsStart, "primary");
