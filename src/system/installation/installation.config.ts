const url = new URL(window.location.href);
const params = url.searchParams;

const isAppdev = params.get("appdev") !== null;

export const folders: string[] = [
	"/",

	"/System",
	"/System/CoreExecutables",
	"/System/CoreComponents",
	"/System/CoreLibraries",
	"/System/CoreAssets",
	"/System/CoreAssets/Logos",
	"/System/dumps",
	"/System/CoreServices",

	"/System/CoreLibraries/mimes",

	"/Users",
	"/Applications",

	"/.Cores"
];

export type installerFileEntryType =
	| "text"
	| "jsonFilesIndex"
	| "binary"
	| "application";

export const files: Record<
	string,
	| string
	| {
			type: installerFileEntryType;
			directory: string;
	  }
> = {
	// system IDX
	"/build/indexes/system.idx": {
		type: "jsonFilesIndex",
		directory: "/System"
	},

	// finder app
	"/build/indexes/com.constellation.finder.idx": {
		type: "application",
		directory: "/Applications/Finder.appl"
	},

	// logos
	"/logos/Constellation.svg": "/System/CoreAssets/Logos/Constellation.svg",
	"/logos/Lucide.svg": "/System/CoreAssets/Logos/Constellation-lucide.svg",
	"/logos/Web.svg": "/System/CoreAssets/Logos/Constellation-Web.svg",

	// init system
	"/build/indexes/com.constellation.CoreExecutable.idx": {
		type: "application",
		directory: "/System/CoreExecutables/CoreExecutable.srvc"
	},

	// terminal
	"/build/indexes/com.constellation.terminal.idx": {
		type: "application",
		directory: "/Applications/Terminal.appl"
	},

	// Popup
	"/build/indexes/com.constellation.popup.idx": {
		type: "application",
		directory: "/System/CoreExecutables/Popup.appl"
	},
	// Settings
	"/build/indexes/com.constellation.settings.idx": {
		type: "application",
		directory: "/Applications/Settings.appl"
	},
	// Search
	"/build/indexes/com.constellation.search.idx": {
		type: "application",
		directory: "/Applications/Search.appl"
	},
	// Dock & Desktop
	"/build/indexes/com.constellation.dock.idx": {
		type: "application",
		directory: "/System/CoreExecutables/Dock.appl"
	},
	// Library
	"/build/indexes/com.constellation.library.idx": {
		type: "application",
		directory: "/System/CoreExecutables/Library.appl"
	},

	// assets
	"/build/indexes/sounds.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreAssets/Sounds"
	},
	"/build/indexes/vectors.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreAssets/Vectors"
	},
	"/build/indexes/wallpapers.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreAssets/Wallpapers"
	},

	// LoginUI
	"/build/indexes/com.constellation.systemLoginInterface.idx": {
		type: "application",
		directory: "/System/CoreExecutables/systemLoginInterface.appl"
	},
	// Calculator
	"/build/indexes/com.constellation.calculator.idx": {
		type: "application",
		directory: "/Applications/calculator.appl"
	},
	// Out of box experience
	"/build/indexes/com.constellation.oobe.idx": {
		type: "application",
		directory: "/System/CoreExecutables/OOBEInstaller.appl"
	},

	// Filetype database manager
	"/build/indexes/com.constellation.fTypeDbMgr.idx": {
		type: "application",
		directory: "/System/CoreExecutables/filetypeDatabaseManager.srvc"
	},

	"/build/indexes/services.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreServices"
	},

	// languageRunner
	"/build/indexes/com.constellation.crlRuntime.idx": {
		type: "application",
		directory: "/System/CoreExecutables/crlRuntime.appl"
	},

	// preview
	"/build/indexes/com.constellation.preview.idx": {
		type: "application",
		directory: "/Applications/Preview.appl"
	},

	// gui manager
	"/build/indexes/com.constellation.guiManager.idx": {
		type: "application",
		directory: "/System/CoreExecutables/guiManager.appl"
	},

	// User shell
	"/build/indexes/com.constellation.usershell.idx": {
		type: "application",
		directory: "/System/CoreExecutables/Shell.appl"
	},

	// updater
	"/build/indexes/com.constellation.updateinstaller.idx": {
		type: "application",
		directory: "/System/CoreExecutables/SoftwareUpdateInstaller.srvc"
	}
};

if (isAppdev) {
	files["http://localhost:5172/app.idx"] = {
		type: "application",
		directory: "/Applications/developerApplication.appl"
	};
}

/**
 * Options for the user
 */
export interface PostInstallOptions {
	user: {
		username: string;
		displayName: string;
		password: string;
		profilePicture: string;
		//language: string
		//wallpaper: string
	};
}

export const developmentOptions: PostInstallOptions = {
	user: {
		username: "dev",
		displayName: "Developer",
		password: "dev",
		profilePicture: "hammer"
		//language: "",
		//wallpaper: ""
	}
};
