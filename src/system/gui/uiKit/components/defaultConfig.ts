import {
	uikitTextboxConfig,
	uikitTextareaConfig,
	uikitBoxConfig,
	uikitCanvasOptions
} from "../definitions";

export const defaultConfig: {
	uikitTextbox: uikitTextboxConfig;
	uikitTextarea: uikitTextareaConfig;
	uikitBox: uikitBoxConfig;
	uikitCanvasStep: uikitCanvasOptions;
} = {
	uikitTextbox: {
		isInvisible: false,
		isEmpty: false,
		fontSize: undefined,
		disableMobileAutocorrect: false
	},
	uikitTextarea: {
		isInvisible: false,
		isEmpty: false,
		disableMobileAutocorrect: false
	},
	uikitBox: {
		borderRadius: 5,
		isFrosted: false,
		background: "rgb(155, 155, 155)"
	},
	uikitCanvasStep: {
		colour: "rgb(155, 155, 155)"
	}
};
