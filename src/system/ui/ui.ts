import { GraphicalInterface } from "../gui/gui.js";
import { Terminatable } from "../kernel.js";
import { TextInterface } from "../tui/tui.js";

export interface UserInterfaceBase extends Terminatable {
	type: "GraphicalInterface" | "TextInterface";

	init(): Promise<void> | void;

	/**
	 * Sets the status during boot
	 * @param text - Text to display
	 * @param state - Log tyoe (working or error)
	 */
	setStatus(text: string | Error, state?: "working" | "error"): void;

	/**
	 * Displays the result of a kernel panic onscreen
	 */
	panic(text: string): void | Promise<void>;
}

export type UserInterface = GraphicalInterface | TextInterface;
