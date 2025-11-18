import mimes from "./mimes/mimes.js";

if (mimes == undefined) {
	throw new Error(
		"Mimes file is empty and therefore mime types cannot be processed."
	);
}

export function getType(extension: string): string | null {
	for (const type in mimes) {
		const extensions = mimes[type];
		if (extensions.includes(extension)) {
			return type;
		}
	}

	return null;
}
