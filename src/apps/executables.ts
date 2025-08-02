import { registerKeyboardShortcut } from "../io/keyboardShortcuts.js";
import { Renderer } from "../lib/uiKit/uiKit.js";
import { ApplicationAuthorisationAPI, associations } from "../security/env.js";
import { terminate } from "./apps.js";
import { IPCMessage, replyCallback, sendMessage } from "./messages.js";
import { defaultUser, validatePassword } from "../security/users.js";

export let nextPID = 0;

export interface ProgramManifest {
	name: string;
	description: string;
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
	author: string;
	version: number;
	icon?: string;
	dependencies?: string[];
	/**
	 * Whether this application should be exposed to the user and displayed in search etc.
	 */
	userspace?: boolean;
}

export class Framework {
	constructor(directory: string, args: any[], user: string, password: string) {
		this.directory = directory;
		this.env = new ApplicationAuthorisationAPI(directory, user, password, this);
		this.id = nextPID++;
		this.identifier = this.directory + ":" + this.id;
		this.args = args;

		this.sendmessage = this.sendmessage.bind(this);
	}

	async validateCredentials(user: string, password: string) {
		await validatePassword(user, password);
	}

	readonly directory: string;
	readonly id: number;
	readonly identifier: string;
	readonly args: any[];
	readonly startTime: number = Date.now();
	readonly env: ApplicationAuthorisationAPI;

	executing: boolean = false;

	sendmessage(targetID: number, intent: string, data: any, replyCallback?: replyCallback) {
		sendMessage(this.directory, this.id, targetID, intent, data, replyCallback);
	}

	onmessage(msg: IPCMessage) {
		msg;
	}
}

export class Process extends Framework {
	constructor(directory: string, args: any[], user: string, password: string) {
		super(directory, args, user, password);
	}

	name: string | undefined; // use to name an app without including a temporary window header

	data: any = null;

	// program flow
	async init() {}
	frame() {}
	async terminate() {}

	shout(name: string) {
		if (associations[name] == undefined) {
			associations[name] = this.id;
		} else {
			throw new Error(
				"Association by name '" + name + "' is already taken. is another instance of your app already using it?"
			);
		}
	}

	// events
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

	registerKeyboardShortcut = (name: string, key: string, modifiers: string[]) => {
		registerKeyboardShortcut(this, name, key, modifiers);
	};

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

export class Application extends Process {
	constructor(directory: string, args: any[], user: string, password: string) {
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
export class Popup extends Application {
	constructor(directory: string, args: any[], user: string, password: string) {
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
