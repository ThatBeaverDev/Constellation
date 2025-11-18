import { tcpkg } from "./tcpkg.js";
import { tcupkg } from "./tcupkg.js";

export interface ConstellationFileIndex {
	directories: string[];
	files: Record<string, string | { type: "string" | "binary"; data: string }>;
}

export { tcpkg, tcupkg };
