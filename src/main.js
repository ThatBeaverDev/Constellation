import * as installer from "./installation/index.js";

import fs from "./fs.js";

import * as apps from "./apps/apps.js";
import * as windows from "./windows.js";

async function main() {
	await windows.init();

	const firstBoot = (await fs.readFile("/sysarc.json")) == undefined;
	if (firstBoot) {
		await installer.install();
	}

	await apps.execute("/System/CoreExecutables/com.constellation.context");

	setInterval(async () => {
		await apps.run();
	}, 5);
}

main();
