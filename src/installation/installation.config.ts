// /Users, /System, /Applications and /Temporary are premounted and don't need to be created.

const url = new URL(window.location.href);
const params = url.searchParams;

const isAppdev = params.get("appdev") !== null;

export const folders: string[] = [
	"/System",
	"/System/CoreExecutables",
	"/System/CoreComponents",
	"/System/CoreLibraries",
	"/System/CoreAssets",
	"/System/CoreAssets/Logos",
	"/System/windows",
	"/System/dumps",

	"/System/CoreLibraries/mimes",

	"/Users",
	"/Applications",

	"/.Cores"
];

export const files: Record<
	string,
	| string
	| { type: "jsonFilesIndex" | "binary" | "application"; directory: string }
> = {
	// finder app
	"/build/apps/com.constellation.finder.idx": {
		type: "application",
		directory: "/Applications/Finder.appl"
	},

	// libraries
	"/build/syslib/pathinf.js": "/System/CoreLibraries/pathinf.js",
	"/build/syslib/blob.js": "/System/CoreLibraries/blob.js",
	"/build/lib/external/fzf.js": "/System/CoreLibraries/fzf.js",

	// mime library
	"/build/syslib/mime/mimes.js": "/System/CoreLibraries/mimes/mimes.js",
	"/build/syslib/mime.js": "/System/CoreLibraries/mime.js",

	// logos
	"/logos/Constellation.svg": "/System/CoreAssets/Logos/Constellation.svg",
	"/logos/Lucide.svg": "/System/CoreAssets/Logos/Constellation-lucide.svg",
	"/logos/Web.svg": "/System/CoreAssets/Logos/Constellation-Web.svg",

	// init system
	"/build/apps/com.constellation.CoreExecutable.idx": {
		type: "application",
		directory: "/System/CoreExecutables/CoreExecutable.backgr"
	},

	// terminal
	"/build/apps/com.constellation.terminal.idx": {
		type: "application",
		directory: "/Applications/Terminal.appl"
	},

	// remapper
	"/build/apps/com.constellation.remapper.idx": {
		type: "application",
		directory: "/Applications/Remapper.appl"
	},

	// Popup
	"/build/apps/com.constellation.popup.idx": {
		type: "application",
		directory: "/System/CoreExecutables/Popup.appl"
	},
	// Settings
	"/build/apps/com.constellation.settings.idx": {
		type: "application",
		directory: "/Applications/Settings.appl"
	},
	// Search
	"/build/apps/com.constellation.search.idx": {
		type: "application",
		directory: "/Applications/Search.appl"
	},
	// Dock & Desktop
	"/build/apps/com.constellation.dock.idx": {
		type: "application",
		directory: "/System/CoreExecutables/Dock.appl"
	},
	// Library
	"/build/apps/com.constellation.library.idx": {
		type: "application",
		directory: "/System/CoreExecutables/Library.appl"
	},

	// windowing files
	"/src/gui/windows/flick.css": "/System/windows/flick.css",
	"/src/gui/windows/scale.css": "/System/windows/scale.css",

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
		type: "application",
		directory: "/System/CoreExecutables/systemLoginInterface.appl"
	},
	// Calculator
	"/build/apps/com.constellation.calculator.idx": {
		type: "application",
		directory: "/Applications/calculator.appl"
	},
	// Out of box experience
	"/build/installation/com.constellation.oobe.idx": {
		type: "application",
		directory: "/System/CoreExecutables/OOBEInstaller.appl"
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
