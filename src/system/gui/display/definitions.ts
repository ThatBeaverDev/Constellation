import { GraphicalWindow } from "./windowTypes.js";

export interface UserPromptConfig {
	title: string;
	subtext: string;
	primary: string;
	secondary?: string;
}
export interface snappingWindowInfo {
	window: GraphicalWindow;
	side: "left" | "right" | "fullscreen" | "bottom" | "top";
}

export const windowFocusPadding = 2;
