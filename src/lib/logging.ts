type logLevel = "debug" | "log" | "warn" | "error";

function coreLogging(type: logLevel, origin: string, ...content: any[]) {
	const logger = console[type];

	logger("{" + origin + "} -", ...content);
}

export function debug(initiator: string, ...content: any[]): undefined {
	coreLogging("debug", initiator, ...content);
}
export function log(initiator: string, ...content: any[]): undefined {
	coreLogging("log", initiator, ...content);
}
export function warn(initiator: string, ...content: any[]): undefined {
	coreLogging("warn", initiator, ...content);
}
export function error(initiator: string, ...content: any[]): undefined {
	coreLogging("error", initiator, ...content);
}
