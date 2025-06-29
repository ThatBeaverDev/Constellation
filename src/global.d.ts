// globals.d.ts
import * as envType from "./apps/api.js";

export {}; // mark as module to allow global augment

declare global {
	interface Window {
		env: typeof envType;
	}

	const env: typeof envType;
}
