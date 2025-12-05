import uiKitCreators from "./components/creators.js";

export class uiKitInitialisationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "uikit (init)";
		this.cause = "uikitInit";
	}
}

export type uikitCreatorName = Extract<keyof uiKitCreators, `uikit${string}`>;

// onClick types
export interface onClickOptions {
	scale?: number;
	clickScale?: number;
	origin?: string;
}
export interface clickReference extends onClickOptions {
	left?: (x: number, y: number) => Promise<any> | any;
	right?: (x: number, y: number) => Promise<any> | any;
}

export type onDragReference = {
	type: "file";
	data: string;
};
export interface onDropReference {
	callback?: Function;
}

// steps
export interface ConfigStep {
	type: uikitCreatorName;
	args: any[];
}
export interface step extends ConfigStep {
	element: HTMLElement;
}

export interface textboxCallbackObject {
	update?: (key: string, value: string) => void;
	enter?: (value: string) => void;
}
export interface canvasRenderingStep {
	type: "line" | "rectangle" | "text" | "image";
	data: any;
}

// configs and options
export type uikitTextboxConfig = {
	isInvisible?: boolean;
	isEmpty?: boolean;
	fontSize?: number;
	disableMobileAutocorrect?: boolean;
};
export type uikitTextareaConfig = {
	isInvisible?: boolean;
	isEmpty?: boolean;
	disableMobileAutocorrect?: boolean;
};
export type uikitBoxConfig = {
	borderRadius?: number | string;
	isFrosted?: boolean;
	background?: string | "sidebar";
};
export type uikitCanvasOptions = {
	colour: string;
};

export type canvasPosition = {
	x: number;
	y: number;
};
export type canvasLineOptions = {
	colour?: string;
};

export interface uikitIconOptions {
	noProcess?: boolean;
}

export const font = "system-ui, Arial, monospace";
