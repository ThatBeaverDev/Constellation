type constellationConfiguration = {
	version: string;
	keyword: string;
	wallpaper: string;
	importOverrides: Object;
	userfile: string;
	userDirectories: string[];
};

const obj: constellationConfiguration = {
	version: "25.6.1a",
	keyword: "Sahara",
	wallpaper: "/pics/Sahara Night Sky.jpg",
	importOverrides: {
		"/System/apps.js": "/build/apps/apps.js",
		"/System/windows.js": "/build/windows.js",
		"/System/uiKit.js": "/build/lib/uiKit.js",
		"/System/executables.js": "/build/apps/executables.js"
	},
	userfile: "/System/users.json",
	userDirectories: ["Desktop", "Documents", "Applications", "Media", "Notes", "Media/Music", "Media/Pictures", "Media/Videos"]
};

export default obj;
