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

	"/System/Caches",
	"/System/Caches/glyphs",

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
	"/Constellation-Sahara-Ares/build/indexes/system.idx": {
		type: "jsonFilesIndex",
		directory: "/System"
	},

	// finder app
	"/Constellation-Sahara-Ares/build/indexes/com.constellation.finder.idx": {
		type: "application",
		directory: "/Applications/Finder.appl"
	},

	// logos
	"/Constellation-Sahara-Ares/logos/Constellation.svg":
		"/System/CoreAssets/Logos/Constellation.svg",
	"/Constellation-Sahara-Ares/logos/Lucide.svg":
		"/System/CoreAssets/Logos/Constellation-lucide.svg",
	"/Constellation-Sahara-Ares/logos/Web.svg":
		"/System/CoreAssets/Logos/Constellation-Web.svg",

	// init system
	"/Constellation-Sahara-Ares/build/indexes/com.constellation.CoreExecutable.idx":
		{
			type: "application",
			directory: "/System/CoreExecutables/CoreExecutable.srvc"
		},

	// terminal
	"/Constellation-Sahara-Ares/build/indexes/com.constellation.terminal.idx": {
		type: "application",
		directory: "/Applications/Terminal.appl"
	},

	// Popup
	"/Constellation-Sahara-Ares/build/indexes/com.constellation.popup.idx": {
		type: "application",
		directory: "/System/CoreExecutables/Popup.appl"
	},
	// Settings
	"/Constellation-Sahara-Ares/build/indexes/com.constellation.settings.idx": {
		type: "application",
		directory: "/Applications/Settings.appl"
	},
	// Search
	"/Constellation-Sahara-Ares/build/indexes/com.constellation.search.idx": {
		type: "application",
		directory: "/Applications/Search.appl"
	},
	// Dock & Desktop
	"/Constellation-Sahara-Ares/build/indexes/com.constellation.dock.idx": {
		type: "application",
		directory: "/System/CoreExecutables/Dock.appl"
	},
	// Library
	"/Constellation-Sahara-Ares/build/indexes/com.constellation.library.idx": {
		type: "application",
		directory: "/System/CoreExecutables/Library.appl"
	},

	// assets
	"/Constellation-Sahara-Ares/build/indexes/sounds.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreAssets/Sounds"
	},
	"/Constellation-Sahara-Ares/build/indexes/vectors.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreAssets/Vectors"
	},
	"/Constellation-Sahara-Ares/build/indexes/wallpapers.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreAssets/Wallpapers"
	},

	// LoginUI
	"/Constellation-Sahara-Ares/build/indexes/com.constellation.systemLoginInterface.idx":
		{
			type: "application",
			directory: "/System/CoreExecutables/systemLoginInterface.appl"
		},
	// Out of box experience
	"/Constellation-Sahara-Ares/build/indexes/com.constellation.oobe.idx": {
		type: "application",
		directory: "/System/CoreExecutables/OOBEInstaller.appl"
	},

	// Filetype database manager
	"/Constellation-Sahara-Ares/build/indexes/com.constellation.fTypeDbMgr.idx":
		{
			type: "application",
			directory: "/System/CoreExecutables/filetypeDatabaseManager.srvc"
		},

	"/Constellation-Sahara-Ares/build/indexes/services.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreServices"
	},

	// preview
	"/Constellation-Sahara-Ares/build/indexes/com.constellation.preview.idx": {
		type: "application",
		directory: "/Applications/Preview.appl"
	},

	// gui manager
	"/Constellation-Sahara-Ares/build/indexes/com.constellation.guiManager.idx":
		{
			type: "application",
			directory: "/System/CoreExecutables/guiManager.appl"
		},

	// User shell
	"/Constellation-Sahara-Ares/build/indexes/com.constellation.usershell.idx":
		{
			type: "application",
			directory: "/System/CoreExecutables/Shell.appl"
		},

	// updater
	"/Constellation-Sahara-Ares/build/indexes/com.constellation.updateinstaller.idx":
		{
			type: "application",
			directory: "/System/CoreExecutables/SoftwareUpdateInstaller.srvc"
		},

	// application installer
	"/Constellation-Sahara-Ares/build/indexes/com.constellation.applicationInstaller.idx":
		{
			type: "application",
			directory: "/System/CoreExecutables/applicationInstaller.appl"
		},

	// process manager
	"/Constellation-Sahara-Ares/build/indexes/com.constellation.systemMonitor.idx":
		{
			type: "application",
			directory: "/System/CoreExecutables/processManager.appl"
		},

	// desktop
	"/Constellation-Sahara-Ares/build/indexes/com.constellation.desktop.idx": {
		type: "application",
		directory: "/System/CoreExecutables/Desktop.appl"
	},

	// textedit
	"/Constellation-Sahara-Ares/build/indexes/com.constellation.textedit.idx": {
		type: "application",
		directory: "/Applications/Text.appl"
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
		wallpaperPath?: string;
	};
}

export const developmentOptions: PostInstallOptions = {
	user: {
		username: "dev",
		displayName: "Developer",
		password: "dev",
		profilePicture: "hammer"
	}
};
