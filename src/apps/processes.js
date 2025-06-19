import { Renderer } from "../lib/uiKit/uiKit.js";
import fs from "../fs.js";
import { execute } from "./apps.js";

export class Process {
	constructor(directory) {
		this.directory = directory;
		this.os = {
			fs,
			exec: execute
		};
	}

	// program flow
	init() {}
	frame() {}
	terminate() {}
}

export class Application extends Process {
	constructor(directory) {
		super(directory);
		this.renderer = new Renderer(this);
	}

	// events
	keydown() {}
	keyup() {}
}

export class BackgroundProcess extends Process {}
