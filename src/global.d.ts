// globals.d.ts
import { ApplicationAuthorisationAPI } from "./system/security/env.js";
import * as executables from "./system/runtime/components/executables.js";

export {}; // mark as module to allow global augment

declare global {
	interface String {
		textAfter(after: string): string;
		textAfterAll(after: string): string;
		textBefore(before: string): string;
		textBeforeLast(before: string): string;
		map(mappings: any): string;
	}

	interface Window {
		renderID: number;
		GuiApplication: typeof executables.GuiApplication;
		Process: typeof executables.Process;
		BackgroundProcess: typeof executables.BackgroundProcess;
		Overlay: typeof executables.Overlay;
		Module: typeof executables.Module;
		env: ApplicationAuthorisationAPI;
		runtime: "nodejs" | "browser" | "deno";
	}

	const GuiApplication: typeof executables.GuiApplication;
	const Process: typeof executables.Process;
	const BackgroundProcess: typeof executables.BackgroundProcess;
	const Overlay: typeof executables.Overlay;
	const Module: typeof executables.Module;

	type ApplicationManifest = executables.ProgramManifest;
}
