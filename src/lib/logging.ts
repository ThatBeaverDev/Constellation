type logLevel = "debug" | "log" | "warn" | "error";

function rgbToAnsi256(rgbColour: RGBColour) {
	const [r, g, b] = rgbColour;

	if (r === g && g === b) {
		if (r < 8) return 16;
		if (r > 248) return 231;
		return Math.round(((r - 8) / 247) * 24) + 232;
	}
	return (
		16 +
		36 * Math.round((r / 255) * 5) +
		6 * Math.round((g / 255) * 5) +
		Math.round((b / 255) * 5)
	);
}

type RGBColour = [number, number, number];

const debug: RGBColour = [50, 168, 83];
const log: RGBColour = [255, 255, 255];
const warning: RGBColour = [253, 243, 170];
const error: RGBColour = [253, 170, 170];

const debugAnsii = `\x1b[38;5;${rgbToAnsi256(debug)}m`;
const logAnsii = `\x1b[38;5;${rgbToAnsi256(log)}m`;
const warningAnsii = `\x1b[38;5;${rgbToAnsi256(warning)}m`;
const errorAnsii = `\x1b[38;5;${rgbToAnsi256(error)}m`;

function coreLogging(type: logLevel, origin: string, ...content: any[]) {
	const logger = console[type];

	let escape = "";
	switch (type) {
		case "debug":
			escape = debugAnsii;
			break;
		case "log":
			escape = logAnsii;
			break;
		case "warn":
			escape = warningAnsii;
			break;
		case "error":
			escape = errorAnsii;
			break;
	}

	logger(`${escape}{${origin}}\x1b[0m`, "-", ...content);
}

export default class LoggingAPI {
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
