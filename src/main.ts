import * as installer from "./installation/index.js";
import conf from "./constellation.config.js";

import fs from "./fs.js";

import * as apps from "./apps/apps.js";
import * as windows from "./windows.js";

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
	return this.split("").reverse().join("").textAfter(before).split("").reverse().join("");
};

async function main() {
	await windows.init();

	const firstBoot = (await fs.readFile("/sysarc.json")) == undefined;
	if (firstBoot) {
		await installer.install();
	}

	await apps.execute("/System/CoreExecutables/com.constellation.context");

	if (conf.devApp !== undefined) {
		await apps.execute(conf.devApp);
	}

	setInterval(async () => {
		await apps.run();
	}, 5);
}

main();
