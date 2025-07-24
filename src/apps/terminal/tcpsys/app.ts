import { uikitTextboxConfig } from "../../../lib/uiKit/uiKit";
import { IPCMessage } from "../../messages";

// convert anything to a string, NICELY (no [object Object] here)
function stringify(content: object, fancy: boolean = false) {
	const type = typeof content;

	switch (type) {
		case "object":
			if (content instanceof HTMLElement) {
				return content.outerHTML;
			}

			if (fancy) {
				return JSON.stringify(content, null, 4);
			} else {
				return JSON.stringify(content);
			}
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
	pretext: string = "";

	async init() {
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

		this.logs.push(this.pretext + " " + text);

		let logs, result;

		this.env.shell.setRef({
			path: this.terminalPath,
			env: this.env,
			logs: this.logs,
			clearLogs: (() => {
				this.logs = [];
			}).bind(this),
			origin: this.directory
		});

		try {
			result = await this.env.shell.exec(cmd, ...args);
			if (result == undefined) return;

			logs = result.result || "";
			this.terminalPath = result.ref.path;
			this.logs = result.ref.logs;
		} catch (e) {
			logs = String(e);
		}

		if (typeof logs !== "string") {
			logs = stringify(logs, true);
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

		for (const i of this.logs) {
			this.renderer.text(0, y, i);
			y += 18;
		}

		y += 5;

		this.renderer.text(0, y, this.pretext);
		const sideTextWidth = this.renderer.getTextWidth(this.pretext);

		const textboxCallbacks = {
			update: () => {},
			enter: (text: string) => {
				this.execute(text);
			}
		};
		const textboxConfig: uikitTextboxConfig = {
			isInvisible: true,
			isEmpty: true,
			disableMobileAutocorrect: true
		};

		this.renderer.textbox(
			sideTextWidth + 5,
			y,
			this.renderer.window.dimensions.width - (sideTextWidth * 2 + 5),
			20,
			"",
			textboxCallbacks,
			textboxConfig
		);

		this.renderer.commit();
		this.hasExecutedCommand = false;
	}

	frame() {
		if (this.willCrash) {
			throw new Error("terminalCrashRequested");
		}

		this.pretext = this.terminalPath;

		this.render();
	}
}
