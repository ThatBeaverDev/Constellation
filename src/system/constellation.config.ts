import { getFlagValue } from "./lib/flags.js";

export const defaultConfiguration: ConstellationConfiguration = {
	wallpaper: "/System/CoreAssets/Wallpapers/Jaguar.jpg",
	wallpaperPosition: "center",
	userfile: "/System/users.json",
	userDirectories: [
		"recentlyDeleted",
		"Desktop",
		"Documents",
		"Applications",
		"Media",
		"Notes",
		"Media/Music",
		"Media/Pictures",
		"Media/Videos"
	],

	dynamic: {
		isDevmode: getFlagValue("dev") == "true",
		isTestingInstaller: getFlagValue("installerTest") == "true",
		status: ""
	},
	systemPassword: "TODO:systemPasswordThatNeedsToBeChanged",
	guiInstallerRan: false
};

export interface ConstellationConfiguration {
	wallpaper: string;
	wallpaperPosition: "center";
	userfile: string;
	userDirectories: string[];
	dynamic: {
		isDevmode: boolean;
		isTestingInstaller: boolean;
		status: string;
	};
	systemPassword: string;
	guiInstallerRan: boolean;
}
