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
	}
};

// /Users, /System, /Applications and /Temporary are premounted and don't need to be created.
export const folders = ["/System/CoreExecutables", "/System/Tools"];
