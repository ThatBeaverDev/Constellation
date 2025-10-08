// globals.d.ts
import { ApplicationAuthorisationAPI } from "./security/env.js";
import * as executables from "./runtime/executables.js";

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
		Application: typeof executables.Application;
		Process: typeof executables.Process;
		BackgroundProcess: typeof executables.BackgroundProcess;
		Overlay: typeof executables.Overlay;
		Module: typeof executables.Module;
		env: ApplicationAuthorisationAPI;
		runtime: "nodejs" | "browser" | "deno";
	}

	const env: ApplicationAuthorisationAPI;
	const Application: typeof executables.Application;
	const Process: typeof executables.Process;
	const BackgroundProcess: typeof executables.BackgroundProcess;
	const Overlay: typeof executables.Overlay;
	const Module: typeof executables.Module;

	type ApplicationManifest = executables.ProgramManifest;

	const runtime: "node" | "browser";
}
