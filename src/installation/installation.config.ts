// /Users, /System, /Applications and /Temporary are premounted and don't need to be created.

const url = new URL(window.location.href);
const params = url.searchParams;

const isAppdev = params.get("appdev") !== null;

export const folders: string[] = [
	"/System/CoreExecutables",
	"/System/CoreComponents",
	"/System/CoreLibraries",
	"/System/CoreAssets",
	"/System/CoreAssets/Logos",
	"/System/windows",

	"/System/CoreLibraries/mimeFiles"
];

export const files: any = {
	// finder app
	"/build/apps/com.constellation.finder.idx": {
		type: "jsonFilesIndex",
		directory: "/Applications/Finder.appl"
	},

	// libraries
	"/build/syslib/pathinf.js": "/System/CoreLibraries/pathinf.js",
	"/build/syslib/keyboardUtils.js": "/System/CoreLibraries/keyboardUtils.js",
	"/build/syslib/blob.js": "/System/CoreLibraries/blob.js",
	"/build/lib/external/fzf.js": "/System/CoreLibraries/fzf.js",

	// mime library
	"/build/syslib/mime/mimes.js": "/System/CoreLibraries/mimeFiles/mimes.js",
	"/build/syslib/mime.js": "/System/CoreLibraries/mime.js",

	// logos
	"/logos/Constellation.svg": "/System/CoreAssets/Logos/Constellation.svg",
	"/logos/Lucide.svg": "/System/CoreAssets/Logos/Constellation-lucide.svg",
	"/logos/Web.svg": "/System/CoreAssets/Logos/Constellation-Web.svg",

	// init system
	"/build/apps/com.constellation.launchd.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreExecutables/launchd.backgr"
	},

	// terminal
	"/build/apps/com.constellation.terminal.idx": {
		type: "jsonFilesIndex",
		directory: "/Applications/Terminal.appl"
	},

	// remapper
	"/build/apps/com.constellation.remapper.idx": {
		type: "jsonFilesIndex",
		directory: "/Applications/Remapper.appl"
	},

	// Popup
	"/build/apps/com.constellation.popup.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreExecutables/Popup.appl"
	},
	// Settings
	"/build/apps/com.constellation.settings.idx": {
		type: "jsonFilesIndex",
		directory: "/Applications/Settings.appl"
	},
	// Search
	"/build/apps/com.constellation.search.idx": {
		type: "jsonFilesIndex",
		directory: "/Applications/Search.appl"
	},
	// Dock & Desktop
	"/build/apps/com.constellation.dock.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreExecutables/Dock.appl"
	},
	// Library
	"/build/apps/com.constellation.library.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreExecutables/Library.appl"
	},

	// windowing files
	"/src/windows/flick.css": "/System/windows/flick.css",
	"/src/windows/scale.css": "/System/windows/scale.css",

	// sounds
	"/build/assets/sounds.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreAssets/Sounds"
	},
	// vectors
	"/build/assets/vectors.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreAssets/Vectors"
	},

	// LoginUI
	"/build/apps/com.constellation.systemLoginInterface.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreExecutables/systemLoginInterface.appl"
	},
	// Calculator
	"/build/apps/com.constellation.calculator.idx": {
		type: "jsonFilesIndex",
		directory: "/Applications/calculator.appl"
	}
};

if (isAppdev) {
	files["http://localhost:5172/app.idx"] = {
		type: "jsonFilesIndex",
		directory: "/Applications/developerApplication.appl"
	};
}

/**
 * Options for the user
 */
export interface options {
	user: {
		username: string;
		displayName: string;
		password: string;
		profilePicture: string;
		//language: string
		//wallpaper: string
	};
}

export const developmentOptions: options = {
	user: {
		username: "dev",
		displayName: "Developer",
		password: "dev",
		profilePicture: "hammer"
		//language: "",
		//wallpaper: ""
	}
};
