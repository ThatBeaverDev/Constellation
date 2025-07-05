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
		directory: "/System/CoreExecutables/com.constellation.finder"
	},

	// apps system
	"/build/apps/apps.js": "/System/CoreComponents/apps.js",

	// libraries
	"/src/syslib/pathinf.sjs": "/System/CoreLibraries/pathinf.sjs",
	"/src/syslib/keyboardUtils.sjs": "/System/CoreLibraries/keyboardUtils.sjs",
	"/src/syslib/userFileSelector.sjs":
		"/System/CoreLibraries/userFileSelector.sjs",
	"/src/syslib/blob.sjs": "/System/CoreLibraries/blob.sjs",

	// init system
	"/build/apps/build/com.constellation.CoreExecutable.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreExecutables/com.constellation.CoreExecutable"
	},

	// terminal
	"/build/apps/build/com.constellation.terminal.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreExecutables/com.constellation.terminal"
	},

	// remapper
	"/build/apps/build/com.constellation.remapper.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreExecutables/com.constellation.remapper"
	},
	// Popup
	"/build/apps/build/com.constellation.popup.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreExecutables/com.constellation.popup"
	},
	// Settings
	"/build/apps/build/com.constellation.settings.idx": {
		type: "jsonFilesIndex",
		directory: "/Applications/com.constellation.settings"
	},

	// windowing files
	"/src/windows/tiling.css": "/System/windows/tiling.css",
	"/src/windows/floating.css": "/System/windows/floating.css"
};
