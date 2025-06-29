// globals.d.ts
import * as envType from "./apps/api.js";
import * as executables from "./apps/executables.js";

export {}; // mark as module to allow global augment

declare global {
	interface Window {
		env: typeof envType;
		Application: new (directory: string, args: any[]) => executables.Application;
		BackgroundProcess: new (directory: string, args: any[]) => executables.BackgroundProcess;
	}

	const env: typeof envType;
	const Application: new (directory: string) => executables.Application;
	const BackgroundProcess: new (directory: string) => executables.BackgroundProcess;
}
