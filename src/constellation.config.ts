const isLocalhost = window.location.hostname == "localhost";
const baseWallpaperURL = isLocalhost
	? "/wallpapers/Originals/"
	: "/wallpapers/";

if (isLocalhost) {
	console.log("localhost detected - using 4K wallpapers.");
}

export const name = "Constellation";
export const version = "25.7.1a";
export const keyword = "Sahara";
export const wallpaper = baseWallpaperURL + "Walid Ahmad - Desert Night.jpg";
export const wallpaperPosition = "center";
export const importOverrides = {
	"/System/apps.js": "/build/apps/apps.js",
	"/System/windows.js": "/build/windows/windows.js",
	"/System/uiKit.js": "/build/lib/uiKit/uiKit.js",
	"/System/executables.js": "/build/apps/executables.js",
	"/System/keybindings.js": "/build/io/keyboardShortcuts.js",
	"/System/CoreLibraries/fs.js": "/build/fs.js",
	"/System/CoreLibraries/srcFS.js": "/build/lib/external/browserfs.js",
	"/System/constellation.config.js": "/build/constellation.config.js"
};
export const userfile = "/System/users.json";
export const userDirectories = [
	"Desktop",
	"Documents",
	"Applications",
	"Media",
	"Notes",
	"Media/Music",
	"Media/Pictures",
	"Media/Videos"
];
export const isDevmode =
	new URL(window.location.href).searchParams.get("dev") !== null;

export let status = "";
export function setStatus(
	text: string | Error,
	state: "working" | "error" = "working"
) {
	if (state == "error") {
		console.error("[/System/installer.js] - ", text);
	} else {
		console.log("[/System/installer.js] - ", text);
	}

	status = String(text);

	if (text instanceof Error) {
		const style = document.createElement("style");
		style.textContent = `
		img.bootImage {
			filter: hue-rotate(80deg) saturate(1000%) !important;
		}

		p.bootText {
			color: red !important;
		}

		span.loader {
			border-color: red !important;
		}

		span.loader::after {
			background-color: red !important;
			animation: none !important;
			width: 100%;
		}
		`;
		document.body.appendChild(style);

		setTimeout(() => {
			throw text;
		}, 5000);
	}
}
