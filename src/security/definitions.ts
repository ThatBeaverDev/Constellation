import { DevToolsColor, performanceLog } from "../lib/debug.js";

export function securityTimestamp(
	label: string,
	start: DOMHighResTimeStamp,
	colour: DevToolsColor = "secondary"
) {
	performanceLog(label, start, "SystemSecurity", colour);
}

export type fsResponse<T> =
	| {
			data: Error;
			ok: false;
	  }
	| { data: T; ok: true };

export type directoryPointType =
	| "blockDevice"
	| "characterDevice"
	| "directory"
	| "FIFO"
	| "file"
	| "socket"
	| "symbolicLink"
	| "none";

export type WindowAlias = {
	move: Function;
	resize: Function;
	close: Function;

	minimise: Function;
	unminimise: Function;
	minimised: boolean;

	fullscreen: Function;
	unfullscreen: Function;
	fullscreened: boolean;

	show: Function;
	hide: Function;

	showHeader: Function;
	hideHeader: Function;

	name: string;
	shortName?: string;
	iconName: string;
	winID: number;
	applicationDirectory?: string;

	position: {
		left: number;
		top: number;
	};
	dimensions: {
		width: number;
		height: number;
	};
};

export interface UserAlias {
	name: string;
	fullName: string;
	pictures: {
		profile: string;
	};
	id: string;
	directory: string;
	lastLogin: number;
	allowGraphicalLogin: boolean;
}

export interface ProcessAlias {
	directory: string;
	args: any[];
	children: ProcessAlias[];
	kernelID: number;

	username: string;
	id: number;
	startTime: number;

	terminate: Function;
}
