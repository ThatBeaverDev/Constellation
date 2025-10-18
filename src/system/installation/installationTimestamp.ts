import { DevToolsColor, performanceLog } from "../lib/debug.js";

export function installationTimestamp({
	label,
	start,
	colour = "secondary"
}: {
	label: string;
	start: DOMHighResTimeStamp;
	colour?: DevToolsColor;
}) {
	performanceLog(label, start, "SystemInstallation", colour);
}
