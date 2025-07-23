import { MessageError } from "../errors.js";
import { registerKeyboardShortcut } from "../io/keyboardShortcuts.js";
import { Renderer } from "../lib/uiKit/uiKit.js";
import { ApplicationAuthorisationAPI, associations } from "../security/env.js";
import { execute, processes, terminate } from "./apps.js";
import { IPCMessage, replyCallback, sendMessage } from "./messages.js";
import { defaultUser } from "../security/users.js";

export let nextPID = 0;

interface ApplicationManifest {
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
	icon: string;
}

export class Framework {
	constructor(directory: string, args: any[]) {
		this.directory = directory;
		this.env = new ApplicationAuthorisationAPI(
			directory,
			defaultUser,
			this
		);
		this.id = nextPID++;
		this.identifier = this.directory + ":" + this.id;
		this.args = args;

		this.sendmessage = this.sendmessage.bind(this);
	}

	readonly directory: string;
	readonly id: number;
	readonly identifier: string;
	readonly args: any[];
	readonly startTime: number = Date.now();
	readonly env: ApplicationAuthorisationAPI;

	executing: boolean = false;

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

	onmessage(msg: IPCMessage) {
		msg;
	}
}

export class Process extends Framework {
	constructor(directory: string, args: any[]) {
		super(directory, args);
	}

	name: string | undefined; // use to name an app without including a temporary window header

	data: any;

	// program flow
	async init() {}
	frame() {}
	async terminate() {}

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

	registerKeyboardShortcut = (
		name: string,
		key: string,
		modifiers: string[]
	) => {
		registerKeyboardShortcut(this, name, key, modifiers);
	};

	exit(value?: any) {
		terminate(this);

		for (const i in this) {
			delete this[i];
		}

		this.data = value;
	}
}

export class Module extends Framework {}

export class Application extends Process {
	constructor(directory: string, args: any[]) {
		super(directory, args);
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
	constructor(directory: string, args: any[]) {
		super(directory, args);

		const no = popupNo++;

		this.renderer.window.move(undefined, undefined, no);

		this.#windowPositioningInterval = setInterval(() => {
			this.renderer.window.move(undefined, undefined, no);
		}, 500);
	}

	#windowPositioningInterval: number;

	exit(value?: any) {
		clearInterval(this.#windowPositioningInterval);

		super.exit(value);
	}
}
