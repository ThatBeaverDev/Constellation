// /Users, /System, /Applications and /Temporary are premounted and don't need to be created.
export const folders: string[] = [
	"/System/CoreExecutables",
	"/System/CoreComponents",
	"/System/CoreLibraries",
	"/System/CoreLibraries/gitFiles",
	"/System/CoreAssets",
	"/System/CoreAssets/Logos",
	"/System/windows"
];

export const files: any = {
	// finder app
	"/build/apps/build/com.constellation.finder.idx": {
		type: "jsonFilesIndex",
		directory: "/Applications/Finder.appl"
	},

	// apps system
	"/build/apps/apps.js": "/System/CoreComponents/apps.js",

	// libraries
	"/build/syslib/pathinf.js": "/System/CoreLibraries/pathinf.js",
	"/build/syslib/keyboardUtils.js": "/System/CoreLibraries/keyboardUtils.js",
	"/build/syslib/userFileSelector.js":
		"/System/CoreLibraries/userFileSelector.js",
	"/build/syslib/blob.js": "/System/CoreLibraries/blob.js",
	"/build/lib/external/fzf.js": "/System/CoreLibraries/fzf.js",
	// git
	"/build/syslib/git.js": "/System/CoreLibraries/git.js",
	"/build/lib/external/isomorphicgit/isomorphic-git.js":
		"/System/CoreLibraries/gitFiles/isomorphic-git.js",
	"/build/lib/external/isomorphicgit/http.js":
		"/System/CoreLibraries/gitFiles/http.js",

	// logos
	"/logos/Constellation.svg": "/System/CoreAssets/Logos/Constellation.svg",
	"/logos/Web.svg": "/System/CoreAssets/Logos/Constellation-Web.svg",
	"/logos/White.svg": "/System/CoreAssets/Logos/Constellation-White.svg",

	// init system
	"/build/apps/build/com.constellation.CoreExecutable.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreExecutables/launchd.backgr"
	},

	// terminal
	"/build/apps/build/com.constellation.terminal.idx": {
		type: "jsonFilesIndex",
		directory: "/Applications/Terminal.appl"
	},

	// remapper
	"/build/apps/build/com.constellation.remapper.idx": {
		type: "jsonFilesIndex",
		directory: "/Applications/Remapper.appl"
	},

	// Popup
	"/build/apps/build/com.constellation.popup.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreExecutables/Popup.appl"
	},
	// Rotur
	"/build/apps/build/com.rotur.appl.idx": {
		type: "jsonFilesIndex",
		directory: "/Applications/Rotur.appl"
	},
	"/build/apps/build/com.rotur.backgr.idx": {
		type: "jsonFilesIndex",
		directory: "/Applications/Rotur.backgr"
	},
	// Settings
	"/build/apps/build/com.constellation.settings.idx": {
		type: "jsonFilesIndex",
		directory: "/Applications/Settings.appl"
	},
	// Search
	"/build/apps/build/com.constellation.search.idx": {
		type: "jsonFilesIndex",
		directory: "/Applications/Search.appl"
	},
	// Dock & Desktop
	"/build/apps/build/com.constellation.dock.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreExecutables/Dock.appl"
	},

	// windowing files
	"/src/windows/tiling.css": "/System/windows/tiling.css",
	"/src/windows/floating.css": "/System/windows/floating.css"
};
