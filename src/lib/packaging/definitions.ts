import mimes from "../../syslib/mime/mimes.js";
import { tcpkg } from "./tcpkg.js";
import { tcupkg } from "./tcupkg.js";

export interface ConstellationFileIndex {
	directories: string[];
	files: Record<string, string | { type: "string" | "binary"; data: string }>;
}

export function getMimeType(extension: string): string | null {
	for (const type in mimes) {
		const extensions = mimes[type];
		if (extensions.includes(extension)) {
			return type;
		}
	}

	return null;
}

export { tcpkg, tcupkg };
