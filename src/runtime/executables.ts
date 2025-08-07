import { registerKeyboardShortcut } from "../io/keyboardShortcuts.js";
import { Renderer } from "../lib/uiKit/uiKit.js";
import { ApplicationAuthorisationAPI, associations } from "../security/env.js";
import { terminate } from "./runtime.js";
import { IPCMessage, replyCallback, sendMessage } from "./messages.js";
import { defaultUser, validatePassword } from "../security/users.js";

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
		directory: string,
		args: any[],
		user: string,
		password: string
	) {
		this.directory = directory;
		this.env = new ApplicationAuthorisationAPI(
			directory,
			user,
			password,
			this
		);
		this.id = nextPID++;
		this.identifier = this.directory + ":" + this.id;
		this.args = args;

		this.sendmessage = this.sendmessage.bind(this);
	}

	/**
	 * Function called to validate user credentials. Throws an error if incorrect.
	 * @param user - Username to validate on.
	 * @param password - Password to validate with.
	 */
	async validateCredentials(user: string, password: string) {
		await validatePassword(user, password);
	}

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
		sendMessage(
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
	constructor(
		directory: string,
		args: any[],
		user: string,
		password: string
	) {
		super(directory, args, user, password);
	}

	/**
	 * use to name the process.
	 */
	name: string | undefined;

	data: any = null;
	/**
	 * Child processes from `this.env.exec()`.
	 */
	children: Process[] = [];

	// program flow
	/**
	 * The initial function called when the program is executed.
	 */
	async init() {}
	/**
	 * The function called within the main execution loop after init and before terminate.
	 */
	frame() {}
	/**
	 * The final function called when the program is closed. this does NOT execute if the program crashes.
	 */
	async terminate() {}

	/**
	 * Registers this process to a name for other programs to lookup and then send messages to.
	 * @param name - Name to register the program to.
	 */
	shout(name: string) {
		if (associations[name] == undefined) {
			associations[name] = this.id;
		} else {
			throw new Error(
				"Association by name '" +
					name +
					"' is already taken. is another instance of your app already using it?"
			);
		}
	}

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
	): void | undefined | null {
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
	): void | undefined | null {
		code;
		metaKey;
		altKey;
		ctrlKey;
		shiftKey;
		repeat;
	}

	/**
	 * Function to commmunicate with the keyboardAPI to register a keyboard shortcut.
	 * @param name - Name of the shorcut
	 * @param key - Main key of the shortcut, as declared [here](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values).
	 * @param modifiers - Modifiers which must be held to trigger the shortcut, as [here](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values) again.
	 */
	registerKeyboardShortcut = (
		name: string,
		key: string,
		modifiers: string[]
	) => {
		registerKeyboardShortcut(this, name, key, modifiers);
	};

	/**
	 * Function to exit the process, and pass a value out through the executor's AppWaitingObject.
	 * @param value - the value to pass to the executor.
	 */
	exit(value?: Exclude<any, null>) {
		this.data = value;

		terminate(this);

		for (const i in this) {
			if (i == "data") continue;

			delete this[i];
		}
	}
}

export class Module extends Framework {}

/**
 * A Process but with builtin APIs for graphical output, like a pre-created window and uiKit instance.
 */
export class Application extends Process {
	constructor(
		directory: string,
		args: any[],
		user: string,
		password: string
	) {
		super(directory, args, user, password);
		this.renderer = new Renderer(this);
	}

	renderer: Renderer;

	exit(value?: any) {
		this.renderer.terminate();

		super.exit(value);
	}
}

export class BackgroundProcess extends Process {}

let popupNo = 25000;
/**
 * An application made for acting on a higher level of the layering. Not to be used in normal applications.
 */
export class Popup extends Application {
	constructor(
		directory: string,
		args: any[],
		user: string,
		password: string
	) {
		super(directory, args, user, password);

		const no = popupNo++;

		this.renderer.moveWindow(undefined, undefined, no);

		this.#windowPositioningInterval = setInterval(() => {
			this.renderer.moveWindow(undefined, undefined, no);
		}, 500);
	}

	#windowPositioningInterval: number;

	exit(value?: Exclude<any, null>) {
		clearInterval(this.#windowPositioningInterval);

		super.exit(value);
	}
}
