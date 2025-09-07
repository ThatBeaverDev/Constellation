import { isCommandLine } from "../getPlatform.js";

type logLevel = "post" | "debug" | "log" | "warn" | "error";

function coreLogging(type: logLevel, origin: string, ...content: any[]) {
	if (isCommandLine) {
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
}

export default class LoggingAPI {
	post(mainLog: any, ...content: any[]) {
		coreLogging("post", "", mainLog, ...content);
	}
	debug(initiator: string, mainLog: any, ...content: any[]): undefined {
		coreLogging("debug", initiator, mainLog, ...content);
	}
	log(initiator: string, mainLog: any, ...content: any[]): undefined {
		coreLogging("log", initiator, mainLog, ...content);
	}
	warn(initiator: string, mainLog: any, ...content: any[]): undefined {
		coreLogging("warn", initiator, mainLog, ...content);
	}
	error(initiator: string, mainLog: any, ...content: any[]): undefined {
		coreLogging("error", initiator, mainLog, ...content);
	}
}
