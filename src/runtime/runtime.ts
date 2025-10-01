import { Process } from "./executables.js";
import * as executables from "./executables.js";

import { AppInitialisationError } from "../errors.js";
import ProcessWaitingObject from "./appWaitingObject.js";
import {
	ApplicationAuthorisationAPI,
	EnvironmentCreator
} from "../security/env.js";
import { DevToolsColor, performanceLog } from "../lib/debug.js";
import ConstellationKernel, { Terminatable } from "../kernel.js";
import { importRewriter } from "./codeProcessor.js";
import { dump } from "./crashed.js";
import ConstellationConfiguration from "../constellation.config.js";
import { UserPromptConfig } from "../gui/windows/windows.js";

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
		Overlay: typeof executables.Overlay;
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
	args: any[];

	// state
	program: Process;
	children: ProcessInformation[];
}

export const processes: ProcessInformation[] = [];
if (ConstellationConfiguration.isDevmode) {
	(window as any).processes = processes;
}

window.renderID = 0;

// allow processes to access this
window.Application = executables.Application;
window.BackgroundProcess = executables.BackgroundProcess;
window.Overlay = executables.Overlay;
window.Module = executables.Module;

export function getProcessFromID(id: number): Process | undefined {
	for (const proc of processes) {
		if (proc.id == id) {
			return proc.program;
		}
	}
}

type executionFiletype = "js" | "crl";
export type executionResult = {
	promise: Promise<any>;
	hasExited: boolean;
};

const crlDirectory = "/System/CoreExecutables/crlRuntime.appl";

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
				(child) => child.program !== proc
			);
	}

	if (proc.data == null) {
		// insure the respective AppWaitingObject can resolve itself.
		proc.data = undefined;
	}

	processes.splice(idx, 1);

	AppsTimeStamp(`Terminate process ${procDir}`, start);
}

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
	EnvironmentCreator: EnvironmentCreator & Terminatable;
	associations: Record<string, Process["id"]> = {};
	id: number = nextProgramRuntimeId++;
	#ConstellationKernel: ConstellationKernel;
	isTerminating: boolean = false;

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

	documentKeyDown(event: KeyboardEvent) {
		const UserInterface = this.#ConstellationKernel.GraphicalInterface;
		if (UserInterface == undefined) return;

		const keylisteners = new Set([
			// focused window
			UserInterface.windows.getWindowOfId(
				UserInterface.windows.focusedWindow
			)?.Application,

			// key listeners
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
	}

	documentKeyUp(event: KeyboardEvent) {
		const UserInterface = this.#ConstellationKernel.GraphicalInterface;
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

		if (this.#ConstellationKernel.isGraphical) {
			document.addEventListener(
				"keydown",
				this.documentKeyDown.bind(this)
			);
			document.addEventListener("keyup", this.documentKeyUp.bind(this));
		}

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
	 * Starts a program from a given directory to a `.appl` or `.backgr` package
	 * @param directory - Directory of the root of the application to execute from
	 * @param args - Arguements to be passed to the process
	 * @param user - Username to start this process with
	 * @param password - Password of the selected user
	 * @param parent? - Parent process
	 * @param waitForInit - Whether function should wait for the `init` function of the program to finish
	 * @returns an Object containing a promise with the Process Waiting object - this promise will resolve when the process exits, and return the value the process exited with.
	 */
	async execute(
		appdir: string,
		args: any[] = [],
		user: string,
		password: string,
		parent?: Process,
		waitForInit: boolean = true
	): Promise<executionResult> {
		if (this.isTerminating)
			throw new Error("Execution blocked: this kernel is terminating.");

		const start = performance.now();

		this.#ConstellationKernel.lib.logging.debug(
			path,
			"Executing program from " + appdir
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
			const rel = this.#ConstellationKernel.fs.resolve(appdir, dir);

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
		const config = (await import(configBlob))
			.default as executables.ProgramManifest;
		config;

		const allowedExtensions: executionFiletype[] = ["js", "crl"];

		let executableDirectory: string | undefined;
		let type: executionFiletype | undefined;
		const tcpsys = await this.#ConstellationKernel.fs.readdir(
			this.#ConstellationKernel.fs.resolve(appdir, "tcpsys")
		);

		// get the script
		for (const ext of allowedExtensions) {
			if (tcpsys.includes("app." + ext)) {
				executableDirectory = this.#ConstellationKernel.fs.resolve(
					appdir,
					"tcpsys/app." + ext
				);
				type = ext;
				break;
			}
		}

		if (executableDirectory == undefined)
			throw new Error("No Executable found.");

		let data: string = "";

		const finalProgramArgs: any[] = [...args];
		let directory = String(appdir);

		switch (type) {
			case "crl":
				executableDirectory = this.#ConstellationKernel.fs.resolve(
					String(crlDirectory),
					"tcpsys/app.js"
				);

				finalProgramArgs.splice(
					0,
					0,
					this.#ConstellationKernel.fs.resolve(
						directory,
						"tcpsys/app.crl"
					)
				);

			case "js":
				const content =
					await this.#ConstellationKernel.fs.readFile(
						executableDirectory
					);

				if (content == undefined) {
					throw new AppInitialisationError(
						executableDirectory + " is empty and cannot be executed"
					);
				}

				const importsResolved = await this.importsRewriter.processCode(
					content,
					executableDirectory
				);

				data = importsResolved;
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
			finalProgramArgs,
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

		const info: ProcessInformation = {
			id: Number(executables.nextPID),
			counter: 0,
			kernel: this.#ConstellationKernel,
			directory,
			startTime: Date.now(),
			args: finalProgramArgs,
			program: live,
			children: []
		};

		if (parent !== undefined) {
			if (parent?.children !== undefined) parent.children.push(live);

			const parentInfo =
				processes[
					processes.map((info) => info.program).indexOf(parent)
				];

			parentInfo.children.push(info);
		}

		// add to the processes list
		processes.push(info);

		if (waitForInit) {
			await this.procExec(info, "init");
		} else {
			// not waiting for anybody.
			this.procExec(info, "init");
		}

		AppsTimeStamp(`Open program from ${directory}`, start);

		const result = ProcessWaitingObject(live);

		return result;
	}

	importsRewriter: importRewriter & Terminatable;

	async showPrompt(
		type: "error" | "warning" | "log",
		title: string,
		description?: string,
		buttons?: string[]
	) {
		const gui = this.#ConstellationKernel.GraphicalInterface;

		if (gui == undefined) return;

		let icon: string;
		switch (type) {
			case "log":
				icon = "scroll-text";
				break;
			case "warning":
				icon = "triangle-alert";
				break;
			case "error":
				icon = "circle-x";
				break;
		}

		const config: UserPromptConfig = {
			title: String(title),
			subtext: String(description) || "",
			primary: String(buttons?.[0] || "Cancel")
		};
		if (buttons?.[1]) {
			config.secondary = String(buttons[1]);
		}

		const choice = await gui.windows.showUserPrompt(icon, config);
		switch (choice) {
			case "primary":
				return buttons?.[0] || "Cancel";
			case "secondary":
				return buttons?.[0] || undefined;
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

			await process[subset](info.args);

			process.executing = false;
			return;
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

	async terminate() {
		// EnvironmentCreator is terminated by security, which creates it.

		this.isTerminating = true;

		processes.forEach((processInfo) => {
			if (processInfo.kernel === this.#ConstellationKernel) {
				terminate(processInfo.program);
			}
		});

		if (this.#ConstellationKernel.isGraphical) {
			document.removeEventListener("keydown", this.documentKeyDown);
			document.removeEventListener("keyup", this.documentKeyUp);
		}

		await this.importsRewriter.terminate();
	}
}

AppsTimeStamp("Startup of src/apps/apps.js", appsStart, "primary");
