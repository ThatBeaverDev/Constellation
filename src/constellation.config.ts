import ConstellationKernel from "./kernel.js";
import { getFlagValue } from "./lib/flags.js";

const path = "/System/constellation.config.js";

export default class ConstellationConfiguration {
	name: string = "Constellation";
	version: string = "25.7.1a";
	keyword: string = "Sahara";
	wallpaper: string;
	wallpaperPosition: string = "center";
	userfile: string = "/System/users.json";
	userDirectories: string[] = [
		"recentlyDeleted",
		"Desktop",
		"Documents",
		"Applications",
		"Media",
		"Notes",
		"Media/Music",
		"Media/Pictures",
		"Media/Videos"
	];
	isDevmode: boolean = getFlagValue("dev") == "true";
	static isDevmode: boolean = getFlagValue("dev") == "true";
	systemPassword = "TODO:systemPasswordThatNeedsToBeChanged";

	status: string = "";
	#ConstellationKernel: ConstellationKernel;

	constructor(ConstellationKernel: ConstellationKernel) {
		const isLocalhost = window.location.hostname == "localhost";
		const baseWallpaperURL = isLocalhost
			? "/wallpapers/Originals/"
			: "/wallpapers/";

		this.wallpaper = baseWallpaperURL + "Walid Ahmad - Desert Night.jpg";
		this.#ConstellationKernel = ConstellationKernel;
	}

	setStatus(text: string | Error, state: "working" | "error" = "working") {
		this.status = String(text);

		if (this.#ConstellationKernel.GraphicalInterface !== undefined) {
			this.#ConstellationKernel.GraphicalInterface.setStatus(text, state);
		}

		if (state == "error") {
			this.#ConstellationKernel.lib.logging.error(path, text);
		} else {
			this.#ConstellationKernel.lib.logging.debug(path, text);
		}
	}
}
