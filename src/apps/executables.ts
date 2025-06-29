import { registerKeyboardShortcut } from "../keyboardShortcuts.js";
import { Renderer } from "../lib/uiKit/uiKit.js";
import fs from "../fs.js";
import { execute } from "./apps.js";

export class OsAPI {
	fs = fs;
	exec = execute;
}

export let nextPID = 0;
export class Process {
	constructor(directory: string) {
		this.directory = directory;
		this.os = new OsAPI();
		this.id = nextPID++;
	}

	directory: string;
	os: OsAPI;
	readonly id: number;

	executing: boolean = false;

	// program flow
	init(...any: any) {
		any;
	}
	frame(...any: any) {
		any;
	}
	terminate(...any: any) {
		any;
	}

	// events
	keydown(...any: any) {
		any;
	}
	keyup(...any: any) {
		any;
	}

	onmessage(...any: any) {
		any;
	}

	registerKeyboardShortcut = (name: string, key: string, modifiers: string[]) => {
		registerKeyboardShortcut(this, name, key, modifiers);
	};
}

export class Application extends Process {
	constructor(directory: string) {
		super(directory);
		this.renderer = new Renderer(this);
	}

	renderer: Renderer;

	// events
	keydown() {}
	keyup() {}
}

export class BackgroundProcess extends Process {}
