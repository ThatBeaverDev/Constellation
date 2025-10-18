import { DevToolsColor, performanceLog } from "../../lib/debug.js";

export function windowsTimestamp(
	label: string,
	start: DOMHighResTimeStamp,
	colour: DevToolsColor = "secondary"
) {
	performanceLog(label, start, "WindowSystem", colour);
}
