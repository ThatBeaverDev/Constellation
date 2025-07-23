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
			text: "Minimise Animation",
			default: 0,
			options: ["flick", "scale"],
			getValue: () => {
				return windows.minimiseAnimation;
			},
			setValue: (value: string) => {
				// the windowTilingMode stores a boolean for whether we are the tiling mode.
				windows.setMinimiseEffect(value);
			}
		}
	]
};
