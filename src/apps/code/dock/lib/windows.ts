const windowsAPI = await env.include("/System/windows.js");

export default function windows(parent: any, intent: string) {
	switch (intent) {
		case "tile":
			windowsAPI.setWindowTilingMode(true);
			break;
		case "float":
			windowsAPI.setWindowTilingMode(false);
			break;
		default:
			return "Window Organisation Modes:\n   windows tile\n   windows float";
	}

	return "Successfully updated window tiling format";
}
