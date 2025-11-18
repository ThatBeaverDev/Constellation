/// <reference types="node" />

import { isBrowser } from "../getPlatform.js";

export function getFlagValue(name: string): string {
	if (isBrowser) {
		// use URL parameters (eg: example.com/system?dev)

		const url = new URL(globalThis.location.href);
		const value = url.searchParams.get(name);

		switch (value) {
			case "":
				return "true";
			case null:
				break;
			default:
				return value;
		}
	} else if (process) {
		// use execution parameters (eg: tcp --dev)

		const args = structuredClone(process.argv);
		args.splice(0, 2);

		const fullParam = "--" + name + "=";
		const presentParameter = "--" + name;

		if (args.includes(presentParameter)) {
			return "true";
		}

		const withoutEquals = args
			.map((item) => [item.textBefore("=") + "=", item.textAfter("=")])
			.filter((item) => !["", "="].includes(item[0]));

		for (const item of withoutEquals) {
			if (item[0] == fullParam) {
				return item[1];
			}
		}
	}

	return "";
}
