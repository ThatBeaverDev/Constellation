import ConstellationKernel, { Terminatable } from "../kernel.js";

const path = "/System/Security/runtimeDefender.js";

const allowedSubdirectories = [
	"tcpsys", // contains the main executable file
	"config.js", // app config
	"docs", // documentation
	"components", // subfiles
	"data", // application data, generally per-user
	"resources", // resource media like images
	"lib", // terminal files
	"tests" // tests, duh
];

export default class ApplicationVerifier implements Terminatable {
	#ConstellationKernel: ConstellationKernel;

	constructor(ConstellationKernel: ConstellationKernel) {
		this.#ConstellationKernel = ConstellationKernel;
	}

	async verifyApplication(directory: string) {
		this.#ConstellationKernel.lib.logging.debug(
			path,
			`Starting verification of application at ${directory}`
		);

		const listing = await this.#ConstellationKernel.fs.readdir(directory);
		if (listing == undefined)
			throw new Error(`Application at ${directory} doesn't exist.`);

		if (!listing.includes("tcpsys") || !listing.includes("config.js")) {
			this.#ConstellationKernel.lib.logging.warn(
				path,
				`Application at ${directory} has failed tcpsys testing.`
			);

			return false;
		}

		this.#ConstellationKernel.lib.logging.debug(
			path,
			`Application at ${directory} has passed tcpsys testing.`
		);

		listing.forEach((item) => {
			if (!allowedSubdirectories.includes(item)) {
				this.#ConstellationKernel.lib.logging.warn(
					path,
					`Application at ${directory} has failed subdirectories testing.`
				);
				throw new Error(
					`Application at ${directory} has failed the security check: it has an invalid subdirectory (${item}).`
				);
			}
		});

		this.#ConstellationKernel.lib.logging.debug(
			path,
			`Application at ${directory} has passed subdirectories testing.`
		);

		const tcpsysListing = await this.#ConstellationKernel.fs.readdir(
			this.#ConstellationKernel.fs.resolve(directory, "tcpsys")
		);
		for (const item of tcpsysListing) {
			if (item.startsWith("app.")) {
				return true;
			} else {
				this.#ConstellationKernel.lib.logging.warn(
					path,
					`Application at ${directory} has failed tcpsys/app.* testing. (there is an unknown file in the tcpsys directory, ${item})`
				);
				throw new Error(
					`Application at ${directory} has failed the security check: it has an invalid file within tcpsys/${item}`
				);
			}
		}

		this.#ConstellationKernel.lib.logging.warn(
			path,
			`Application at ${directory} has failed tcpsys/app.* testing.`
		);

		return false;
	}

	async terminate() {}
}
