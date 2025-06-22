type logLevel = "debug" | "log" | "warn" | "error";

function coreLogging(type: logLevel, origin: string, content: any) {
	const logger = console[type];

	logger("{" + origin + "} -", content);
}

export function debug(initiator: string, content: string | Object): undefined {
	coreLogging("debug", initiator, content);
}
export function log(initiator: string, content: string | Object): undefined {
	coreLogging("log", initiator, content);
}
export function warn(initiator: string, content: string | Object): undefined {
	coreLogging("warn", initiator, content);
}
export function error(initiator: string, content: string | Object): undefined {
	coreLogging("error", initiator, content);
}
