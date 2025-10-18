import * as executables from "./executables.js";

export function appName(proc: executables.Framework) {
	// @ts-expect-error
	if (proc.name !== undefined) return proc.name;

	// @ts-expect-error
	const windowName = proc?.renderer?.window?.name;

	if (windowName !== undefined && windowName !== proc.directory)
		return windowName;

	const constructorName = Object.getPrototypeOf(proc).constructor.name;

	return constructorName;
}
