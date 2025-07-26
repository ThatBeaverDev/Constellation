import uiKitCreators from "./creators";

export class uiKitInitialisationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "uikit (init)";
		this.cause = "uikitInit";
	}
}

export type uikitCreatorName = {
	[K in keyof uiKitCreators]: K extends `uikit${string}` ? K : never;
}[keyof uiKitCreators];

export interface onClickOptions {
	scale?: number;
	origin?: string;
}
export interface clickReference extends onClickOptions {
	left?: Function;
	right?: Function;
}

export interface step {
	type: uikitCreatorName;
	args: any[];
	onClick?: clickReference;
}

export interface textboxCallbackObject {
	update?: Function;
	enter?: Function;
}
export interface canvasRenderingStep {
	type: "line" | "rectangle" | "text" | "image";
	data: any;
}

export type uikitTextboxConfig = {
	isInvisible?: boolean;
	isEmpty?: boolean;
	fontSize?: number;
	disableMobileAutocorrect?: boolean;
};
export type uikitTextareaConfig = {
	isInvisible?: boolean;
	isEmpty?: boolean;
	disableMobileAutocorrect: boolean;
};
export type uikitBoxConfig = {
	borderRadius?: number | string;
	background?: string;
};
export type uikitCanvasOptions = {
	colour: string;
};
