import { Process } from "./components/executables.js";
import * as executables from "./components/executables.js";

import { AppInitialisationError } from "../errors.js";
import ProcessWaitingObject from "./components/appWaitingObject.js";
import {
	ApplicationAuthorisationAPI,
	EnvironmentCreator
} from "../security/env.js";
import ConstellationKernel, { Terminatable } from "../kernel.js";
import { dump } from "./components/crashed.js";
import { defaultConfiguration } from "../constellation.config.js";
import { UserPromptConfig } from "../gui/display/definitions.js";
import ApplicationVerifier from "../security/runtimeDefender.js";
import { appName } from "./components/appName.js";
import ImportResolver from "./components/resolver.js";
import { isArrow } from "../security/isArrow.js";

const path = "/System/runtime.js";

export interface ProcessInformation {
	// attachment info
	id: number;
	counter: number;
	kernel: ConstellationKernel;
	user: string;

	// origination
	directory: string;
	startTime: number;
	args: any[];

	// state
	program: Process;
	children: ProcessInformation[];
	parent: ProcessInformation | null;
}

const processes: ProcessInformation[] = [];
if (defaultConfiguration.dynamic.isDevmode) {
	(globalThis as any).processes = processes;
}

window.renderID = 0;

// allow processes to access this
window.GuiApplication = executables.GuiApplication;
window.CommandLineApplication = executables.CommandLineApplication;
window.Process = executables.Process;
window.Service = executables.Service;
window.Overlay = executables.Overlay;
window.Module = executables.Module;

type executionFiletype = "js" | "crl";
export interface executionResult {
	promise: Promise<any>;
	hasExited: boolean;
}
export interface executionProcessResult extends executionResult {
	process: executables.Process;
	info: ProcessInformation;
}

const crlDirectory = "/System/CoreExecutables/crlRuntime.appl";

function generateTerminationCode(length: number) {
	var result = "";
	var characters =
		"§1234567890-=qwertyuiop[]asdfghjkl;'\\`zxcvbnm,./±!@£$%^&*()_+QWERTYUIOP{}ASDFGHJKL:\"|ZXCVBNM<>?~¡€#¢∞§¶•ªº–≠œ∑´®†¥¨^øπ“‘åß∂ƒ©˙∆˚¬…æ«`Ω≈ç√∫~µ≤≥÷⁄™‹›ﬁﬂ‡°·‚—±Œ„‰ÂÊÁË∏”’/* ÍÌ */";
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(
			Math.floor(Math.random() * charactersLength)
		);
	}
	return result;
}

const randomTerminationCode = generateTerminationCode(10000);
if (defaultConfiguration.dynamic.isDevmode) {
	(globalThis as any).randomTerminationCode = randomTerminationCode;
}

declare global {
	interface Window {
		envs: Map<ProgramRuntime["id"], ApplicationAuthorisationAPI>;
	}
}
window.envs = new Map();

let nextProgramRuntimeId = 0;
export class ProgramRuntime {
	/**
	 * Alias of processes list to help with avoiding cirular imports
	 */
	processes: typeof processes = processes;

	/**
	 * This Runtime's environment creator
	 */
	EnvironmentCreator: EnvironmentCreator & Terminatable;
	Verifier: ApplicationVerifier & Terminatable;
	associations: Partial<Record<string, Process["id"]>> = {};
	id: number = nextProgramRuntimeId++;
	#ConstellationKernel: ConstellationKernel;
	isTerminating: boolean = false;

	constructor(
		ConstellationKernel: ConstellationKernel,
		public isGraphical = false
	) {
		this.#ConstellationKernel = ConstellationKernel;
		this.EnvironmentCreator = this.#ConstellationKernel.security.env;
		this.importsRewriter = new ImportResolver(
			this.#ConstellationKernel.fs,
			this.#ConstellationKernel.lib.blobifier
		);
		this.Verifier = new ApplicationVerifier(ConstellationKernel);
	}

	documentKeyDown(event: KeyboardEvent) {
		const UserInterface = this.#ConstellationKernel.ui;
		if (!(UserInterface.type == "GraphicalInterface")) return;

		const keylisteners = new Set([
			// focused window
			UserInterface.windowSystem.getWindowOfId(
				UserInterface.windowSystem.focusedWindow
			)?.Application,

			// key listeners
			...processes
				.filter((info) => info.program.env.hasPermission("keylogger"))
				.map((info) => info.program)
		]);

		function procKeydown(proc?: Process) {
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
		}

		keylisteners.forEach((item) => {
			procKeydown(item);
		});
	}

	documentKeyUp(event: KeyboardEvent) {
		const UserInterface = this.#ConstellationKernel.ui;
		if (!(UserInterface.type == "GraphicalInterface")) return;

		const keylisteners = [
			UserInterface.windowSystem.getWindowOfId(
				UserInterface.windowSystem.focusedWindow
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
		this.#ConstellationKernel.lib.logging.debug(path, "Apps initialising.");

		const env = new ApplicationAuthorisationAPI(
			this.#ConstellationKernel,
			this.EnvironmentCreator,
			"/System/globalPermissionsHost.js",
			"guest",
			"",
			undefined,
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
	}

	frame() {
		for (const pid in processes) {
			const process = processes[pid];

			if (process.kernel == this.#ConstellationKernel) {
				this.procExec(process);
			} else {
				// this isn't our process - that's another kernel's problem.
			}
		}
	}

	/**
	 * Starts a program from a given directory to a `.appl` or `.srvc` package
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
		args: any[],
		user: string,
		password: string,
		parent?: ProcessInformation,
		waitForInit?: boolean,
		includeProcess?: true,
		cliHooks?: {
			print: (text: string) => void;
			getInput: (query: string) => Promise<string>;
			clearView: () => void;
		},
		forceTextEntrypoint?: boolean
	): Promise<executionProcessResult>;
	async execute(
		appdir: string,
		args: any[] = [],
		user: string,
		password: string,
		parent?: ProcessInformation,
		waitForInit: boolean = true,
		includeProcess: boolean = false,
		cliHooks?: {
			print: (text: string) => void;
			getInput: (query: string) => Promise<string>;
			clearView: () => void;
		},
		forceTextEntrypoint: boolean = false
	): Promise<executionResult | executionProcessResult> {
		if (this.isTerminating)
			throw new Error("Execution blocked: this kernel is terminating.");

		this.#ConstellationKernel.lib.logging.debug(
			path,
			"Executing program from " + appdir
		);

		const isOk = await this.Verifier.verifyApplication(appdir);
		if (!isOk)
			throw new Error(
				`Application at ${appdir} is damaged and can't be ran.`
			);

		/* ---------- Work out directory to import from ---------- */

		const allowedExtensions: executionFiletype[] = ["js", "crl"];
		const entrypointName = appdir.endsWith(".srvc")
			? "service"
			: forceTextEntrypoint
				? "cli"
				: this.#ConstellationKernel.isGraphical
					? "app"
					: "cli";

		let executableDirectory: string | undefined;
		let type: executionFiletype | undefined;
		const bin = await this.#ConstellationKernel.fs.readdir(
			this.#ConstellationKernel.fs.resolve(appdir, "bin")
		);

		// get the script
		for (const ext of allowedExtensions) {
			if (bin.includes(`${entrypointName}.${ext}`)) {
				executableDirectory = this.#ConstellationKernel.fs.resolve(
					appdir,
					`bin/${entrypointName}.${ext}`
				);
				type = ext;
				break;
			}
		}

		if (executableDirectory == undefined)
			throw new Error(
				`No valid entrypoint for ${appdir} found. (looking for ./bin/${entrypointName}.**)`
			);

		const finalProgramArgs: any[] = args;
		let directory = String(appdir);

		/* ---------- Create a blob to import from ---------- */

		let blob: string;
		switch (type) {
			case "crl":
				executableDirectory = this.#ConstellationKernel.fs.resolve(
					String(crlDirectory),
					`bin/${entrypointName}.js`
				);

				finalProgramArgs.splice(
					0,
					0,
					this.#ConstellationKernel.fs.resolve(
						directory,
						`bin/${entrypointName}.crl`
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

				blob = await this.importsRewriter.resolve(executableDirectory);

				break;

			default:
				throw new AppInitialisationError(
					"Type '" + type + "' is not executable."
				);
		}

		/* ---------- Retrieve the constructor ---------- */

		// import from the script BLOB
		const exports = await import(blob);

		// get the class executable
		let Executable: typeof Process = exports.default;

		/* ---------- Execute the program ---------- */

		const info: ProcessInformation = {
			id: Number(executables.nextPID),
			counter: 0,
			kernel: this.#ConstellationKernel,
			user: user,

			directory,
			startTime: Date.now(),
			args: finalProgramArgs,
			// @ts-expect-error
			program: undefined,
			children: [],
			parent: parent == undefined ? null : parent
		};

		// create the process
		const live = new Executable(
			this.#ConstellationKernel,
			directory,
			finalProgramArgs,
			user,
			password,
			info
		);

		info.program = live;

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

		if (parent !== undefined) {
			if (parent.children !== undefined) parent.children.push(info);
			if (parent.program.children !== undefined)
				parent.program.children.push(live);
		}

		// add to the processes list
		processes.push(info);

		// allow the CLI to hook into the program so it can provide input and output
		if (cliHooks && live instanceof CommandLineApplication) {
			isArrow(cliHooks.print, true);
			isArrow(cliHooks.getInput, true);
			isArrow(cliHooks.clearView, true);

			live.println = cliHooks.print;
			live.getInput = cliHooks.getInput;
			live.clearView = cliHooks.clearView;
		}

		if (waitForInit) {
			await this.procExec(info, "init");
		} else {
			// not waiting for anybody.
			this.procExec(info, "init");
		}

		const result = ProcessWaitingObject(live);

		if (includeProcess) return { ...result, process: live };

		return result;
	}

	importsRewriter: ImportResolver & Terminatable;

	async showPrompt(
		type: "error" | "warning" | "log",
		title: string,
		description?: string,
		buttons?: string[]
	) {
		const gui = this.#ConstellationKernel.ui;

		if (!(gui.type == "GraphicalInterface")) return;

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

		const choice = await gui.windowSystem.showUserPrompt(icon, config);
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

			await this.#ConstellationKernel.runtime.terminateProcess(process);

			const choice = await this.#ConstellationKernel.runtime.showPrompt(
				"warning",
				`${name} has crashed unexpectedly.`,
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

	/**
	 * Removes a process from execution
	 * @param proc - the Process object of the target to terminate.
	 * @param isDueToCrash - whether this is from a crash - true means the process' terminate function is not called.
	 */
	async terminateProcess(proc: Process) {
		const idx = processes.map((item) => item.program).indexOf(proc);
		if (idx < 0) return;

		const info = processes[idx];

		if (info.kernel !== this.#ConstellationKernel)
			throw new Error(
				"Process cannot be terminated because it is not posessed by this kernel."
			);

		if ((proc as any).terminationCode == randomTerminationCode) {
			// whatever.
			return;
		}

		(proc as any).terminationCode = randomTerminationCode;
		this.#ConstellationKernel.lib.logging.debug(
			path,
			"Terminating process",
			proc
		);

		// run termination code
		try {
			await proc.terminate();
		} catch {}

		// if it's a GUI app, remove the UiKit instance and therefore the GUI window.
		if (proc instanceof GuiApplication) {
			try {
				proc?.renderer?.terminate();
			} catch {}
		}

		// remove the parent's child item
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
	}

	async terminate() {
		// EnvironmentCreator is terminated by security, which creates it.

		this.isTerminating = true;

		processes.forEach((processInfo) => {
			if (processInfo.kernel === this.#ConstellationKernel) {
				this.#ConstellationKernel.runtime.terminateProcess(
					processInfo.program
				);
			}
		});

		if (this.#ConstellationKernel.isGraphical) {
			document.removeEventListener("keydown", this.documentKeyDown);
			document.removeEventListener("keyup", this.documentKeyUp);
		}

		await this.importsRewriter.terminate();
	}
}
