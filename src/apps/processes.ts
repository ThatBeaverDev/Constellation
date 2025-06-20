import { Renderer } from "../lib/uiKit/uiKit.js";
import fs from "../fs.js";
import { execute } from "./apps.js";

export class Process {
	constructor(directory: string) {
		this.directory = directory;
		this.os = {
			fs,
			exec: execute
		};
	}

	directory: string;
	os: Object;

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
