// globals.d.ts
import { ApplicationAuthorisationAPI } from "./security/env.ts";
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
		runtime: "nodejs" | "browser" | "deno";
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
	const Overlay: new (directory: string, args: any[]) => executables.Overlay;
	const Module: new (directory: string, args: any[]) => executables.Module;

	type ApplicationManifest = executables.ProgramManifest;

	const runtime: "node" | "browser";
}
