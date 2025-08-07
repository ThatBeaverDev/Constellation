import { DevToolsColor, performanceLog } from "../debug.js";
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

// onClick types
export interface onClickOptions {
	scale?: number;
	clickScale?: number;
	origin?: string;
}
export interface clickReference extends onClickOptions {
	left?: Function;
	right?: Function;
}

// steps
export interface step {
	type: uikitCreatorName;
	args: any[];
	onClick?: clickReference;
	passthrough?: boolean;
}

export interface textboxCallbackObject {
	update?: Function;
	enter?: Function;
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
	disableMobileAutocorrect: boolean;
};
export type uikitBoxConfig = {
	borderRadius?: number | string;
	blur?: number;
	background?: string;
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
export function uiKitTimestamp(
	label: string,
	start: DOMHighResTimeStamp,
	colour: DevToolsColor = "secondary"
) {
	performanceLog(label, start, "uiKit", colour);
}

export interface uikitIconOptions {
	noProcess?: boolean;
}

export const font = "Inter";
