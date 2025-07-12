import * as installer from "./installation/index.js";

import fs from "./io/fs.js";

import { isDev } from "./lib/isDev.js";
import * as apps from "./apps/apps.js";
import * as users from "./lib/users.js";
import * as log from "./lib/logging.js";

declare global {
	interface String {
		textAfter(after: string): string;
		textAfterAll(after: string): string;
		textBefore(before: string): string;
		textBeforeLast(before: string): string;
	}
}

String.prototype.textAfter = function (after) {
	return this.substring(this.indexOf(after) + String(after).length);
};

String.prototype.textAfterAll = function (after) {
	return this.split(after).pop() ?? "";
};

String.prototype.textBefore = function (before) {
	return this.substring(0, this.indexOf(before));
};

String.prototype.textBeforeLast = function (before) {
	return this.split("")
		.reverse()
		.join("")
		.textAfter(before)
		.split("")
		.reverse()
		.join("");
};

async function main() {
	const testMode =
		new URL(window.location.href).searchParams.get("test") == "true";

	const firstBoot = (await fs.readFile("/sysarc.json")) == undefined;
	if (firstBoot) {
		await installer.install();
	}

	if (isDev) {
		log.debug("core:main", "System in devmode: registering developer user");
		await users.mkusr("Developer", "dev");
	}

	if (testMode) {
		const test = await import("./tests/index.js");

		await test.default();
	}

	await apps.execute("/System/CoreExecutables/launchd.backgr");

	setInterval(async () => {
		await apps.run();
	}, 50);
}

main();
