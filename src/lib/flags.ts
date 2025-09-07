/// <reference types="node" />

export function getFlagValue(name: string): string {
	if (globalThis.Location) {
		// use URL parameters (eg: example.com/system?dev)

		const url = new URL(globalThis.location.href);
		const value = url.searchParams.get(name);

		if (value !== null) {
			return value;
		}
	} else if (process) {
		// use execution parameters (eg: tcp --dev)
		const args = structuredClone(process.argv);
		args.splice(0, 2);

		const fullParam = "--" + name + "=";
		for (const arg of args) {
			if (arg.startsWith("--" + name + "=")) {
				const value = arg.substring(fullParam.length);

				return value;
			} else if (arg == "--" + name) {
				return "true";
			}
		}
	}

	return "";
}
