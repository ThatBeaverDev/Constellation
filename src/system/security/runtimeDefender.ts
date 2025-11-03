import ConstellationKernel, { Terminatable } from "..//kernel.js";

const path = "/System/Security/runtimeDefender.js";

const allowedSubdirectories = [
	"bin", // contains the main executable file
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

		if (!listing.includes("bin") || !listing.includes("config.js")) {
			this.#ConstellationKernel.lib.logging.warn(
				path,
				`Application at ${directory} has failed bin testing.`
			);

			return false;
		}

		this.#ConstellationKernel.lib.logging.debug(
			path,
			`Application at ${directory} has passed bin testing.`
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

		const binListing = await this.#ConstellationKernel.fs.readdir(
			this.#ConstellationKernel.fs.resolve(directory, "bin")
		);
		for (const item of binListing) {
			if (item.startsWith("app.")) {
				return true;
			} else {
				this.#ConstellationKernel.lib.logging.warn(
					path,
					`Application at ${directory} has failed bin/app.* testing. (there is an unknown file in the bin directory, ${item})`
				);
				throw new Error(
					`Application at ${directory} has failed the security check: it has an invalid file within bin/${item}`
				);
			}
		}

		this.#ConstellationKernel.lib.logging.warn(
			path,
			`Application at ${directory} has failed bin/app.* testing.`
		);

		return false;
	}

	async terminate() {}
}
