import { isCommandLine } from "../getPlatform.js";
import ConstellationKernel from "..//kernel.js";
import { TextInterface } from "../tui/tui.js";
import { CommandLineHandler } from "../tui/display.js";

export type LogLevel = "post" | "debug" | "log" | "warn" | "error";
export type CapitalisedLogLevel = "POST" | "DEBUG" | "LOG" | "WARN" | "ERROR";

export default class LoggingAPI {
	#ConstellationKernel: ConstellationKernel;
	constructor(ConstellationKernel: ConstellationKernel) {
		this.#ConstellationKernel = ConstellationKernel;
	}

	post = (mainLog: any, ...content: any[]) => {
		this.coreLogging("post", "", mainLog, ...content);
	};
	debug = (initiator: string, mainLog: any, ...content: any[]): undefined => {
		this.coreLogging("debug", initiator, mainLog, ...content);
	};
	log = (initiator: string, mainLog: any, ...content: any[]): undefined => {
		this.coreLogging("log", initiator, mainLog, ...content);
	};
	warn = (initiator: string, mainLog: any, ...content: any[]): undefined => {
		this.coreLogging("warn", initiator, mainLog, ...content);
	};
	error = (initiator: string, mainLog: any, ...content: any[]): undefined => {
		this.coreLogging("error", initiator, mainLog, ...content);
	};

	coreLogging = (type: LogLevel, origin: string, ...content: any[]) => {
		this.#ConstellationKernel.logs.push([
			type.toUpperCase() as CapitalisedLogLevel,
			origin,
			...content
		]);

		if (isCommandLine) {
			// don't distrupt the TUI
			if (this.#ConstellationKernel.ui instanceof TextInterface) {
				if (
					this.#ConstellationKernel.ui.displayInterface instanceof
					CommandLineHandler
				)
					return;
			}

			// ANSI colors for Node/CLI
			switch (type) {
				case "post":
					console.log(...content);
					break;
				case "debug":
					console.debug(
						`\x1b[38;5;72m{${origin}}`,
						"-",
						...content,
						"\x1b[0m"
					);
					break;
				case "log":
					console.log(
						`\x1b[38;5;231m{${origin}}`,
						"-",
						...content,
						"\x1b[0m"
					);
					break;
				case "warn":
					console.warn(
						`\x1b[38;5;229m{${origin}}`,
						"-",
						...content,
						"\x1b[0m"
					);
					break;
				case "error":
					console.error(
						`\x1b[38;5;217m{${origin}}`,
						"-",
						...content,
						"\x1b[0m"
					);
					break;
			}
		} else {
			// CSS styles for Browser
			let style = "";
			switch (type) {
				case "post":
					console.log(...content);
					break;
				case "debug":
					style = "color: #48bb78;"; // greenish
					console.debug(`%c{${origin}}%c -`, style, "", ...content);
					break;
				case "log":
					style = "color: #ffffff;"; // white
					console.log(`%c{${origin}}%c -`, style, "", ...content);
					break;
				case "warn":
					style = "color: #f6e05e;"; // yellow
					console.warn(`%c{${origin}}%c -`, style, "", ...content);
					break;
				case "error":
					style = "color: #f56565;"; // red
					console.error(`%c{${origin}}%c -`, style, "", ...content);
					break;
			}
		}
	};
}
