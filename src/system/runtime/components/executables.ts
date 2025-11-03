import { UiKitRenderer } from "../../gui/uiKit/uiKit.js";
import { ApplicationAuthorisationAPI } from "../../security/env.js";
import { ProcessInformation } from "../runtime.js";
import { IPCMessage, replyCallback } from "./messages.js";
import ConstellationKernel from "../../kernel.js";
import { OverlayWindow } from "../../gui/display/windowTypes.js";

export let nextPID = 0;

/**
 * The Manifest to inform other programs of basic info about an app, like the name or icon.
 */
export interface ProgramManifest {
	/**
	 * The name of the application.
	 */
	name: string;
	/**
	 * The description of the application.
	 */
	description: string;
	/**
	 * The category of the application.
	 */
	category:
		| "Productivity"
		| "Developer"
		| "Entertainment"
		| "Music"
		| "Games"
		| "Graphics and Design"
		| "Social"
		| "Weather"
		| "Utilities";
	/**
	 * The author of the application's name.
	 */
	author: string;
	/**
	 * The version of the application.
	 */
	version: number;
	/**
	 * The application's icon
	 */
	icon: string;
	dependencies?: string[];
	/**
	 * Whether this application should be exposed to the user and displayed in search etc.
	 */
	userspace?: boolean;
	/**
	 * Which filetypes this application is able to open.
	 */
	filetypes?: string[];
}

/**
 * Fundemental entity which can access directory-based system APIs.
 */
export class Framework {
	/**
	 * Fundemental entity which can access directory-based system APIs.
	 * @param directory - Directory of the executable
	 * @param args - Arguements to pass to the executable.
	 * @param user - the username of the executable
	 * @param password - the password for the executable's user
	 */
	constructor(
		ConstellationKernel: ConstellationKernel,
		directory: string,
		args: any[],
		user: string,
		password: string,
		processInfo: ProcessInformation
	) {
		this.#ConstellationKernel = ConstellationKernel;
		this.directory = directory;

		this.env = ConstellationKernel.security.env.newEnv(
			directory,
			user,
			password,
			this,
			processInfo
		);

		this.id = nextPID++;
		this.identifier = this.directory + ":" + this.id;
		this.args = args;

		this.sendmessage = this.sendmessage.bind(this);
	}

	/**
	 * Function called to validate user credentials. Throws an error if incorrect.
	 * @param ConstellationKernel - Kernel to validate with.
	 * @param user - Username to validate on.
	 * @param password - Password to validate with.
	 */
	async validateCredentials(
		ConstellationKernel: ConstellationKernel,
		user: string,
		password: string
	) {
		await ConstellationKernel.security.users.validatePassword(
			user,
			password
		);
	}

	#ConstellationKernel: ConstellationKernel;
	readonly directory: string;
	/**
	 * The process's ID, used for things like sending messages.
	 */
	readonly id: number;
	readonly identifier: string;
	/**
	 * Arguements from the initial execution of the process.
	 */
	readonly args: any[];
	/**
	 * `Date.now()` for when the process executed.
	 */
	readonly startTime: number = Date.now();
	readonly env: ApplicationAuthorisationAPI;

	/**
	 * Whether the process is currently executing.
	 */
	executing: boolean = false;

	/**
	 * Sends an IPCMessage to another process as addressed by the Process ID.
	 * @param targetID - Process ID of the target process.
	 * @param intent - Reason of message, for example `login`.
	 * @param data - Data to send, such as a password.
	 * @param replyCallback - a Function to be called if the other process replies.
	 */
	sendmessage(
		targetID: number,
		intent: string,
		data: any,
		replyCallback?: replyCallback
	) {
		this.#ConstellationKernel.lib.messageAPI.sendMessage(
			this.#ConstellationKernel,
			this.directory,
			this.id,
			targetID,
			intent,
			data,
			replyCallback
		);
	}

	/**
	 * Function called whenever the process recieves a message.
	 * @param {IPCMessage} msg - Message object.
	 */
	onmessage(msg: IPCMessage) {
		msg;
	}
}

/**
 * An entity with access to system APIs and a startup, repeating 'frame' loop and terminator function.
 */
export class Process extends Framework {
	#ConstellationKernel: ConstellationKernel;
	constructor(
		ConstellationKernel: ConstellationKernel,
		directory: string,
		args: any[],
		user: string,
		password: string,
		processInfo: ProcessInformation
	) {
		super(
			ConstellationKernel,
			directory,
			args,
			user,
			password,
			processInfo
		);
		this.#ConstellationKernel = ConstellationKernel;

		this.shout = function shout(name: string) {
			if (ConstellationKernel.runtime.associations[name] == undefined) {
				ConstellationKernel.runtime.associations[name] = this.id;
			} else {
				throw new Error(
					"Association by name '" +
						name +
						"' is already taken. is another instance of your app already using it?"
				);
			}
		};
	}

	/**
	 * use to name the process.
	 */
	name: string | undefined;

	data: any = null;
	/**
	 * Child processes from `this.env.exec()`.
	 */
	readonly children: Process[] = [];

	// program flow
	/**
	 * The initial function called when the program is executed.
	 */
	async init(args: any[]) {}
	/**
	 * The function called within the main execution loop after init and before terminate.
	 */
	frame() {}

	/**
	 * The final function called when the program is closed. this is also ran upon program crash, in an attempt to clean up.
	 */
	async terminate() {}

	/**
	 * Registers this process to a name for other programs to lookup and then send messages to.
	 * @param name - Name to register the program to.
	 */
	// Code for this is found in constructor since I don't want programs getting their hands on the kernel.
	readonly shout: (name: string) => void;

	// events
	/**
	 * Function triggered when the user presses a key down. Only triggers in processes with keylogging permission OR applications with a focused window.
	 * @param code - Keycode for the key as seen [here](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values)
	 * @param {boolean} metaKey - Whether the Windows / Meta / Super key was held.
	 * @param {boolean} altKey - Whether the Alt / Option key was held.
	 * @param {boolean} ctrlKey - Whether the Control key was held.
	 * @param {boolean} shiftKey - Whether shift was held.
	 * @param {boolean} repeat - Whether this was a repeat.
	 */
	keydown(
		code: string,
		metaKey: boolean,
		altKey: boolean,
		ctrlKey: boolean,
		shiftKey: boolean,
		repeat: boolean
	): void | Promise<void> {
		code;
		metaKey;
		altKey;
		ctrlKey;
		shiftKey;
		repeat;
	}

	/**
	 * Function triggered when the user releases a key. Only triggers in processes with keylogging permission OR applications with a focused window.
	 * @param code - Keycode for the key as seen [here](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values)
	 * @param {boolean} metaKey - Whether the Windows / Meta / Super key was held.
	 * @param {boolean} altKey - Whether the Alt / Option key was held.
	 * @param {boolean} ctrlKey - Whether the Control key was held.
	 * @param {boolean} shiftKey - Whether shift was held.
	 * @param {boolean} repeat - Whether this was a repeat.
	 */
	keyup(
		code: string,
		metaKey: boolean,
		altKey: boolean,
		ctrlKey: boolean,
		shiftKey: boolean,
		repeat: boolean
	): void | Promise<void> {
		code;
		metaKey;
		altKey;
		ctrlKey;
		shiftKey;
		repeat;
	}

	/**
	 * Function to exit the process, and pass a value out through the executor's AppWaitingObject.
	 * @param value - the value to pass to the executor.
	 */
	exit(value?: Exclude<any, null>) {
		this.data = value;

		this.#ConstellationKernel.runtime.terminateProcess(this);

		for (const i in this) {
			if (i == "data") continue;

			delete this[i];
		}
	}
}

export class BackgroundProcess extends Process {}
export class Module extends Framework {}

/**
 * A Process but with builtin APIs for graphical output, like a pre-created window and uiKit instance.
 */
export class GuiApplication extends Process {
	renderer: UiKitRenderer;
	constructor(
		ConstellationKernel: ConstellationKernel,
		directory: string,
		args: any[],
		user: string,
		password: string,
		processInfo: ProcessInformation
	) {
		super(
			ConstellationKernel,
			directory,
			args,
			user,
			password,
			processInfo
		);

		const GraphicalInterface = ConstellationKernel.ui;
		if (!(GraphicalInterface.type == "GraphicalInterface")) {
			throw new Error(
				"Graphical applications cannot run in non-graphical environments."
			);
		}

		const window = GraphicalInterface.windowSystem.newWindow(
			"Application",
			this
		).data;

		this.renderer = GraphicalInterface.uiKit.newRenderer(this, window);
	}

	exit(value?: any) {
		this.renderer.terminate();

		super.exit(value);
	}
}

/**
 * An application made for acting on a higher level of the layering. Not to be used in general applications.
 */
export class Overlay extends Process implements GuiApplication {
	renderer: UiKitRenderer;
	#window: OverlayWindow;
	constructor(
		ConstellationKernel: ConstellationKernel,
		directory: string,
		args: any[],
		user: string,
		password: string,
		processInfo: ProcessInformation
	) {
		super(
			ConstellationKernel,
			directory,
			args,
			user,
			password,
			processInfo
		);

		const UserInterface = ConstellationKernel.ui;
		if (!(UserInterface.type == "GraphicalInterface")) {
			throw new Error(
				"Graphical applications cannot run in non-graphical environments."
			);
		}

		this.#window = new OverlayWindow(
			ConstellationKernel,
			directory,
			this,
			500,
			300
		);
		this.renderer = UserInterface.uiKit.newRenderer(this, this.#window);
	}

	exit(value?: any) {
		this.renderer.terminate();

		super.exit(value);
	}
}
