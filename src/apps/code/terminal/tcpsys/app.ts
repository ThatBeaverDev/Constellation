import { IPCMessage } from "../../../messages";

// convert anything to a string, NICELY (no [object Object] here)
function stringify(content: object) {
	const type = typeof content;

	switch (type) {
		case "object":
			if (content instanceof HTMLElement) {
				return content.outerHTML;
			}

			return JSON.stringify(content);
		default:
			return String(content);
	}
}

const clamp = (n: number, min: number, max: number) => {
	if (n < min) {
		return min;
	}
	if (max < n) {
		return max;
	}

	return n;
};

export default class terminalUI extends Application {
	cmdreg: any;
	logs: string[] = [];
	terminalPath: string = "/";
	scroll: number = 0;
	displayedLogs: number = 50;
	tick: number = 50;
	tick2: number = 0;
	hasExecutedCommand: boolean = false;
	willCrash: boolean = false;

	async init() {
		const cmdregDir = this.env.fs.relative(
			this.directory,
			"./lib/cmdreg.js"
		);
		const reg = await this.env.include(cmdregDir);
		this.cmdreg = new reg.default(this);
		await this.cmdreg.init();

		if (this.args.length !== 0) {
			this.exit(await this.execute(this.args[0]));
			return;
		}

		this.renderer.window.rename("Terminal");
		this.renderer.setWindowIcon("square-terminal");

		this.registerKeyboardShortcut("Scroll Down", "ArrowDown", []);
		this.registerKeyboardShortcut("Scroll Down (Fast)", "ArrowDown", [
			"ShiftLeft"
		]);
		this.registerKeyboardShortcut("Scroll Up", "ArrowUp", []);
		this.registerKeyboardShortcut("Scroll Up (Fast)", "ArrowUp", [
			"ShiftLeft"
		]);
	}

	getCommand(name: string): Function {
		switch (name) {
			case "help":
				return () =>
					`Terminal commands are as follows:\n- ` +
					Object.keys(this.cmdreg).join("\n- ");
			default:
				return this.cmdreg[name];
		}
	}

	onmessage(msg: IPCMessage) {
		const origin = msg.originDirectory;
		const intent = msg.intent;

		switch (origin) {
			case "/System/keyboardShortcuts.js":
				switch (intent) {
					case "keyboardShortcutTrigger-Scroll Down":
						this.scroll = clamp(
							this.scroll - 1,
							0,
							this.logs.length - this.displayedLogs
						);
						break;
					case "keyboardShortcutTrigger-Scroll Down (Fast)":
						this.scroll = clamp(
							this.scroll - 2,
							0,
							this.logs.length - this.displayedLogs
						);
						break;
					case "keyboardShortcutTrigger-Scroll Up":
						this.scroll = clamp(
							this.scroll + 1,
							0,
							this.logs.length - this.displayedLogs
						);
						break;
					case "keyboardShortcutTrigger-Scroll Up (Fast)":
						this.scroll = clamp(
							this.scroll + 2,
							0,
							this.logs.length - this.displayedLogs
						);
						break;
					default:
						throw new Error(
							"Unknown keyboard shortcut name (intent): " + intent
						);
				}
				break;
			default:
				console.warn("Unknown message sender: " + origin);
		}
	}

	keydown(
		code: string,
		metaKey: boolean,
		altKey: boolean,
		ctrlKey: boolean,
		shiftKey: boolean,
		repeat: boolean
	) {
		switch (code) {
			case "ArrowUp":
			case "ArrowDown":
			case "ControlLeft":
			case "ControlRight":
			case "ShiftLeft":
			case "ShiftRight":
			case "MetaLeft":
			case "MetaRight":
			case "AltLeft":
			case "AltRight":
				break;
			default:
				// reset the scroll whenever it's not an arrow key
				this.scroll = 0;
		}
	}

	async execute(text: string) {
		this.hasExecutedCommand = true;

		if (text == "crash") {
			this.willCrash = true;
		}

		const args = text.trim().split(" ");
		const cmd = args.splice(0, 1)[0].trim();

		this.logs.push(text);

		const bin = this.getCommand(cmd);
		if (typeof bin !== "function") {
			this.logs.push(cmd + " is not a known or found command.");
			return;
		}

		let logs;
		try {
			logs = (await bin(this, ...args)) || "";
		} catch (error: any) {
			logs = "<red>" + error.type + ": " + error.message + "</red>";
		}
		if (typeof logs !== "string") {
			logs = stringify(logs);
		}

		if ([null, undefined, ""].includes(logs)) {
			return;
		}

		for (const line of logs.split("\n")) {
			this.logs.push(line);
		}

		this.render();
	}

	render() {
		this.renderer.clear();

		let y = 15;
		const visibleLogs = this.logs.slice(
			-50 - this.scroll,
			-this.scroll || undefined
		);

		for (const i of visibleLogs) {
			this.renderer.text(0, y, i);
			y += 18;
		}

		y += 5;

		if (this.willCrash) {
			throw new Error("terminalCrashRequested");
		}

		this.renderer.textbox(
			0,
			y,
			1000,
			20,
			"",
			{ update: () => {}, enter: (text: string) => this.execute(text) },
			{ isInvisible: true, isEmpty: this.hasExecutedCommand }
		);

		this.renderer.commit();
		this.hasExecutedCommand = false;
	}

	frame() {
		this.render();
	}
}
