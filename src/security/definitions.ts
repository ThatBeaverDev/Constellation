import { DevToolsColor, performanceLog } from "../lib/debug.js";

export function securityTimestamp(
	label: string,
	start: DOMHighResTimeStamp,
	colour: DevToolsColor = "secondary"
) {
	performanceLog(label, start, "SystemSecurity", colour);
}
