export function performanceLog(
	label: string,
	start: DOMHighResTimeStamp,
	subset: string = "undefined",
	colour: DevToolsColor = "primary"
) {
	if (console.timeStamp == undefined) return;

	const end = performance.now();

	(console as any).timeStamp(
		label,
		start,
		end,
		subset,
		"ConstellationCore",
		colour
	);
}

export type DevToolsColor =
	| "primary"
	| "primary-light"
	| "primary-dark"
	| "secondary"
	| "secondary-light"
	| "secondary-dark"
	| "tertiary"
	| "tertiary-light"
	| "tertiary-dark"
	| "error";
