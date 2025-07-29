// globals.d.ts
import { ApplicationAuthorisationAPI } from "./security/env.ts";
import * as executables from "./apps/executables.js";

export {}; // mark as module to allow global augment

declare global {
	interface Window {
		env: ApplicationAuthorisationAPI;
		Application: new (
			directory: string,
			args: any[]
		) => executables.Application;
		BackgroundProcess: new (
			directory: string,
			args: any[]
		) => executables.BackgroundProcess;
		Popup: new (directory: string, args: any[]) => executables.Popup;
		Module: new (directory: string, args: any[]) => executables.Module;
	}

	interface String {
		textAfter(after: string): string;
		textAfterAll(after: string): string;
		textBefore(before: string): string;
		textBeforeLast(before: string): string;
		map(mappings: any): string;
	}

	const env: ApplicationAuthorisationAPI;
	const Application: new (
		directory: string,
		args: any[]
	) => executables.Application;
	const BackgroundProcess: new (
		directory: string,
		args: any[]
	) => executables.BackgroundProcess;
	const Popup: new (directory: string, args: any[]) => executables.Popup;
	const Module: new (directory: string, args: any[]) => executables.Module;

	type ApplicationManifest = executables.ApplicationManifest;
}
