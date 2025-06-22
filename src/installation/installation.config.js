// /Users, /System, /Applications and /Temporary are premounted and don't need to be created.
export const folders = ["/System/CoreExecutables", "/System/CoreComponents", "/System/CoreLibraries"];

export const files = {
	// search app
	"/build/apps/build/com.constellation.search.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreExecutables/com.constellation.search"
	},

	// finder app
	"/build/apps/build/com.constellation.finder.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreExecutables/com.constellation.finder"
	},

	// test app
	"/demoApp.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreExecutables/com.constellation.ApplicationFoundation"
	},

	// apps system
	"/build/apps/apps.js": "/System/CoreComponents/apps.js",
	"/src/syslib/pathicon.sjs": "/System/CoreLibraries/pathicon.sjs",

	// init system
	"/build/apps/build/com.constellation.CoreExecutable.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreExecutables/com.constellation.CoreExecutable"
	}
};
