import * as installer from "./installation/index.js";

import fs from "./io/fs.js";

import { isDev } from "./lib/isDev.js";
import * as apps from "./apps/apps.js";
import * as users from "./security/users.js";
import * as log from "./lib/logging.js";
import { setDirectoryPermission } from "./security/permissions.js";
import * as panic from "./lib/panic.js";

panic.init();

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
	await fsLoaded();

	const firstBoot = (await fs.readFile("/System/arc.json")) == undefined;
	if (firstBoot) {
		await installer.install();
	}

	await users.init();

	const coreExecDirectory = "/System/CoreExecutables/launchd.backgr";

	setDirectoryPermission(coreExecDirectory, "operator", true);
	setDirectoryPermission(coreExecDirectory, "managePermissions", true);
	await apps.execute(coreExecDirectory);

	setInterval(async () => {
		await apps.run();
	}, 50);
}

main();
