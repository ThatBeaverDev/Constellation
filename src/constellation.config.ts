import { getFlagValue } from "./lib/flags.js";

export const defaultConfiguration: ConstellationConfiguration = {
	name: "Constellation",
	version: "25.7.1a",
	keyword: "Sahara",
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
	systemPassword: "TODO:systemPasswordThatNeedsToBeChanged"
};

export interface ConstellationConfiguration {
	name: string;
	version: `${number}.${number}.${number}${"a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"}`;
	keyword: string;
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
}
