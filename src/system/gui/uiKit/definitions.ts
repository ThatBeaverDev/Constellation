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
	hoverEffect: boolean;
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
	beforeUpdate?: (key: string, value: string) => any;
	afterUpdate?: (key: string, value: string) => any;
	enter?: (value: string) => any;
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
	font?: string;
	fontColour?: Colour;
};
export type uikitTextareaConfig = {
	isInvisible?: boolean;
	isEmpty?: boolean;
	disableMobileAutocorrect?: boolean;
	font?: string;
	fontColour?: Colour;
};
export type uikitBoxConfig = {
	borderRadius?:
		| number
		| string
		| [number | string, number | string, number | string, number | string];
	isFrosted?: boolean;
	background?: Colour;
};
export type uikitCanvasOptions = {
	colour: Colour;
};

export type canvasPosition = {
	x: number;
	y: number;
};
export type canvasLineOptions = {
	colour?: Colour;
};

export interface uikitIconOptions {
	borderRadius?: number;
}

export const font = "system-ui, Arial, monospace";

type wordColour =
	| "aliceblue"
	| "antiquewhite"
	| "aqua"
	| "aquamarine"
	| "azure"
	| "beige"
	| "bisque"
	| "black"
	| "blanchedalmond"
	| "blue"
	| "blueviolet"
	| "brown"
	| "burlywood"
	| "cadetblue"
	| "chartreuse"
	| "chocolate"
	| "coral"
	| "cornflowerblue"
	| "cornsilk"
	| "crimson"
	| "cyan"
	| "darkblue"
	| "darkcyan"
	| "darkgoldenrod"
	| "darkgray"
	| "darkgreen"
	| "darkgrey"
	| "darkkhaki"
	| "darkmagenta"
	| "darkolivegreen"
	| "darkorange"
	| "darkorchid"
	| "darkred"
	| "darksalmon"
	| "darkseagreen"
	| "darkslateblue"
	| "darkslategray"
	| "darkslategrey"
	| "darkturquoise"
	| "darkviolet"
	| "deeppink"
	| "deepskyblue"
	| "dimgray"
	| "dimgrey"
	| "dodgerblue"
	| "firebrick"
	| "floralwhite"
	| "forestgreen"
	| "fuchsia"
	| "gainsboro"
	| "ghostwhite"
	| "gold"
	| "goldenrod"
	| "gray"
	| "green"
	| "greenyellow"
	| "grey"
	| "honeydew"
	| "hotpink"
	| "indianred"
	| "indigo"
	| "ivory"
	| "khaki"
	| "lavender"
	| "lavenderblush"
	| "lawngreen"
	| "lemonchiffon"
	| "lightblue"
	| "lightcoral"
	| "lightcyan"
	| "lightgoldenrodyellow"
	| "lightgray"
	| "lightgreen"
	| "lightgrey"
	| "lightpink"
	| "lightsalmon"
	| "lightseagreen"
	| "lightskyblue"
	| "lightslategray"
	| "lightslategrey"
	| "lightsteelblue"
	| "lightyellow"
	| "lime"
	| "limegreen"
	| "linen"
	| "magenta"
	| "maroon"
	| "mediumaquamarine"
	| "mediumblue"
	| "mediumorchid"
	| "mediumpurple"
	| "mediumseagreen"
	| "mediumslateblue"
	| "mediumspringgreen"
	| "mediumturquoise"
	| "mediumvioletred"
	| "midnightblue"
	| "mintcream"
	| "mistyrose"
	| "moccasin"
	| "navajowhite"
	| "navy"
	| "oldlace"
	| "olive"
	| "olivedrab"
	| "orange"
	| "orangered"
	| "orchid"
	| "palegoldenrod"
	| "palegreen"
	| "paleturquoise"
	| "palevioletred"
	| "papayawhip"
	| "peachpuff"
	| "peru"
	| "pink"
	| "plum"
	| "powderblue"
	| "purple"
	| "rebeccapurple"
	| "red"
	| "rosybrown"
	| "royalblue"
	| "saddlebrown"
	| "salmon"
	| "sandybrown"
	| "seagreen"
	| "seashell"
	| "sienna"
	| "silver"
	| "skyblue"
	| "slateblue"
	| "slategray"
	| "slategrey"
	| "snow"
	| "springgreen"
	| "steelblue"
	| "tan"
	| "teal"
	| "thistle"
	| "tomato"
	| "turquoise"
	| "violet"
	| "wheat"
	| "white"
	| "whitesmoke"
	| "yellow"
	| "yellowgreen";

type baseColour =
	| `#${number}`
	| `rgb(${number} ${number} ${number})`
	| `rgb(${number}, ${number}, ${number})`
	| `rgba(${number} ${number} ${number} / ${number})`
	| `rgba(${number}, ${number}, ${number} / ${number})`
	| "transparent"
	| "surface-1"
	| "surface-2"
	| "surface-3"
	| "system-component"
	| "accent"
	| "text"
	| "text-muted";

export type _Colour = baseColour | wordColour;
export type Colour = string;
