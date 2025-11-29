import { tcpkg } from "./tcpkg.js";
import { tcupkg } from "./tcupkg.js";

export interface ConstellationFileIndex {
	directories: string[];
	files: Record<string, string | { type: "string" | "binary"; data: string }>;
}

export interface ConstellationApplicationInstaller {
	name: string;
	icon: string;
	version: number;
	technicalName: string;
	index: ConstellationFileIndex;
}

export { tcpkg, tcupkg };
