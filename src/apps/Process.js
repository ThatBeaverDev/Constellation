import { Renderer } from "../uiKit/uiKit.js";
import fs from "../fs.js";
import { execute } from "./apps.js";

export class Process {
	constructor(directory) {
		this.directory = directory;
		this.renderer = new Renderer(this);
		this.os = {
			fs,
			exec: execute
		};
	}

	// program flow
	init() {}
	frame() {}
	terminate() {}

	// events
	keydown() {}
	keyup() {}
}
