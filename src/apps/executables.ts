import { registerKeyboardShortcut } from "../io/keyboardShortcuts.js";
import { Renderer } from "../lib/uiKit/uiKit.js";
import { execute, terminate } from "./apps.js";

export let nextPID = 0;
export class Process {
	constructor(directory: string, args: any[]) {
		this.directory = directory;
		this.id = nextPID++;
		this.args = args;
	}

	readonly directory: string;
	name: string | undefined; // use to name an app without including a temporary window header
	readonly id: number;
	readonly args: any[];
	data: any;
	readonly startTime: number = Date.now();

	executing: boolean = false;

	// program flow
	init(...any: any): Promise<any> {
		return any;
	}
	frame(...any: any): Promise<any> {
		return any;
	}
	terminate(...any: any): Promise<any> {
		return any;
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

export class Application extends Process {
	constructor(directory: string, args: any[]) {
		super(directory, args);
		this.renderer = new Renderer(this);
	}

	renderer: Renderer;

	// events
	keydown() {}
	keyup() {}

	exit() {
		this.renderer.terminate();

		super.exit();
	}
}

export class BackgroundProcess extends Process {}

let popupNo = 25000;
export class Popup extends Application {
	constructor(directory: string, args: any[]) {
		super(directory, args);

		const no = popupNo++;

		this.renderer.window.move(undefined, undefined, no);
		this.renderer.window.resizable = false;

		this.windowPositioningInterval = setInterval(() => {
			this.renderer.window.move(undefined, undefined, no);
		}, 500);
	}

	private windowPositioningInterval: number;

	exit() {
		clearInterval(this.windowPositioningInterval);

		super.exit();
	}
}
