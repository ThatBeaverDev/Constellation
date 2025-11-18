import { DevToolsColor, performanceLog } from "../../lib/debug.js";

export function AppsTimeStamp(
	label: string,
	start: DOMHighResTimeStamp,
	colour: DevToolsColor = "secondary"
) {
	performanceLog(label, start, "AppsRuntime", colour);
}
