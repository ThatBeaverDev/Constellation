export const files = {
	// search app
	"/src/apps/build/com.constellation.search.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreExecutables/com.constellation.search"
	},

	// context app
	"/src/apps/build/com.constellation.context.idx": {
		type: "jsonFilesIndex",
		directory: "/System/CoreExecutables/com.constellation.context"
	}
};

// /Users, /System, /Applications and /Temporary are premounted and don't need to be created.
export const folders = ["/System/CoreExecutables", "/System/Tools"];
