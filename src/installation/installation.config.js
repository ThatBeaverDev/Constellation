// /Users, /System, /Applications and /Temporary are premounted and don't need to be created.
export const folders = [
	"/System/CoreExecutables",
	"/System/CoreComponents",
	"/System/CoreLibraries",
	"/System/windows"
];

export const files = {
	// finder app
	"/build/apps/build/com.constellation.finder.idx": {
		type: "jsonFilesIndex",
		directory: "/Applications/Finder.appl"
	},

	// apps system
	"/build/apps/apps.js": "/System/CoreComponents/apps.js",

	// libraries
	"/src/syslib/pathinf.sjs": "/System/CoreLibraries/pathinf.sjs",
	"/src/syslib/keyboardUtils.sjs": "/System/CoreLibraries/keyboardUtils.sjs",
	"/src/syslib/userFileSelector.sjs":
		"/System/CoreLibraries/userFileSelector.sjs",
	"/src/syslib/blob.sjs": "/System/CoreLibraries/blob.sjs",
	"/src/lib/external/fzf.js": "/System/CoreLibraries/fzf.sjs",

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
		directory: "/System/CoreExecutables/Remapper.appl"
	},
	// Popup
	"/build/apps/build/com.constellation.popup.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreExecutables/Popup.appl"
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

	// windowing files
	"/src/windows/tiling.css": "/System/windows/tiling.css",
	"/src/windows/floating.css": "/System/windows/floating.css"
};
