const windows = await env.include("/System/windows.js");

let parent;
export function init(process: any) {
	parent = process;
}

export default {
	title: "Windows",
	items: [
		{
			type: "optionsList",
			text: "Tiling Mode",
			default: 0,
			options: ["Floating", "Tiling"],
			getValue: () => {
				return windows.windowTiling;
			},
			setValue: (value: string) => {
				// the windowTilingMode stores a boolean for whether we are the tiling mode.
				const bool = value == "Tiling";

				windows.setWindowTilingMode(bool);
			}
		}
	]
};
