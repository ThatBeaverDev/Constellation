type constellationConfiguration = {
	name: string;
	version: string;
	keyword: string;
	wallpaper: string;
	wallpaperPosition:
		| "left top"
		| "left center"
		| "left bottom"
		| "right top"
		| "right center"
		| "right bottom"
		| "center top"
		| "center center"
		| "center bottom"
		| "bottom"
		| "center"
		| "top"
		| "left"
		| "right";
	importOverrides: Object;
	userfile: string;
	userDirectories: string[];
};

const isLocalhost = window.location.hostname == "localhost";
const baseWallpaperURL = isLocalhost ? "/wallpapers/Originals/" : "/wallpapers/";

if (isLocalhost) {
	console.log("localhost detected - using 4K wallpapers.");
}

const obj: constellationConfiguration = {
	name: "Constellation",
	version: "25.6.1a",
	keyword: "Sahara",
	wallpaper: baseWallpaperURL + "Walid Ahmad - Desert Night.jpg",
	wallpaperPosition: "center",
	importOverrides: {
		"/System/apps.js": "/build/apps/apps.js",
		"/System/windows.js": "/build/windows/windows.js",
		"/System/uiKit.js": "/build/lib/uiKit/uiKit.js",
		"/System/executables.js": "/build/apps/executables.js",
		"/System/keybindings.js": "/build/io/keyboardShortcuts.js",
		"/System/CoreLibraries/fs.js": "/build/fs.js",
		"/System/CoreLibraries/srcFS.js": "/build/lib/external/browserfs.js",
		"/System/constellation.config.js": "/build/constellation.config.js"
	},
	userfile: "/System/users.json",
	userDirectories: [
		"Desktop",
		"Documents",
		"Applications",
		"Media",
		"Notes",
		"Media/Music",
		"Media/Pictures",
		"Media/Videos"
	]
};

export default obj;
