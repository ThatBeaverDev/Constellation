import { tcpkg } from "./tcpkg.js";
import { tcupkg } from "./tcupkg.js";

export interface ConstellationFileIndexv1 {
	directories: string[];
	files: Record<string, string | { type: "string" | "binary"; data: string }>;
}

interface File {
	contents: string;

	created: Date;
	modified: Date;

	size: number;
}
export interface ConstellationFileIndexv2 {
	directories: string[];
	files: Record<string, File>;
	version: 2;
}

export type LatestFileIndex = ConstellationFileIndexv2;
export type FileIndex = ConstellationFileIndexv1 | ConstellationFileIndexv2;

export interface ConstellationApplicationInstaller {
	name: string;
	icon: string;
	version: number;
	technicalName: string;
	index: LatestFileIndex;
}

export { tcpkg, tcupkg };
