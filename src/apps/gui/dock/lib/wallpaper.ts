//import TerminalAlias from "../../../lib/terminalAlias";
//const windowsAPI = await env.include("/System/windows.js");
//
//export default async function wallpaper(
//	parent: TerminalAlias,
//	intent: string,
//	...args: string[]
//): Promise<string> {
//	switch (intent) {
//		case "set": {
//			const dir = parent.env.fs.resolve(parent.path, args[0]);
//
//			const content = await parent.env.fs.readFile(dir);
//
//			const val = `url('${content.data}')`;
//
//			windowsAPI.setCSSVariable("wallpaper-url", val);
//
//			return "";
//		}
//		default:
//			return "Wallpaper intents:\n  set - Sets the wallpaper\n  get - Gets the wallpaper";
//	}
//}

// TODO: Fix - broken since windows API is not available anymore
