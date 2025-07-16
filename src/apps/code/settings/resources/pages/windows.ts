let windows: any;

let parent;
export async function init(process: any) {
	parent = process;
	windows = await parent.env.include("/System/windows.js");
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
