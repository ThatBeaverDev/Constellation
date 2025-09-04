import { default as fs, readFile } from "../io/fs.js";
import {
	getParentDirectory,
	resolveDirectory as resolve
} from "../io/fspath.js";
import { AppsTimeStamp } from "./runtime.js";

/**
 * a Cache of blobs which *never* invalidates! this will surely cause a some problems.
 */
const blobCache = new Map<string, string>();

/**
 *
 * @param - path The directory which should be converted to a blob, assuming it's not cached.
 * @returns The contents of the directory, as a blob.
 */
async function blobifyModule(path: string): Promise<string> {
	if (blobCache.has(path)) return blobCache.get(path)!;

	let code = await readFile(path);

	if (code == undefined) {
		throw new Error(`File at ${path} doesn't exist.`);
	}

	// Rewrite imports to blob URLs
	code = await rewriteImportsAsync(code, path);

	const blob = new Blob([code], { type: "text/javascript" });
	const blobUrl = URL.createObjectURL(blob);

	blobCache.set(path, blobUrl);
	return blobUrl;
}

/**
 * @param - code the code which import replacements should be applied to
 * @param - currentPath the directory from which relative imports will be resolved from
 * @returns the code with all imports resolved to blobs.
 */
export async function rewriteImportsAsync(
	code: string,
	currentPath: string
): Promise<string> {
	const start = performance.now();

	// regex
	const importRegex = /import\s+(.*?)\s+from\s+["'](.+?)["']/g;

	const rewritten = await Promise.all(
		[...code.matchAll(importRegex)].map(async (match) => {
			const [full, bindings, specifier] = match;
			// resolve the path
			const resolved = resolve(
				getParentDirectory(currentPath),
				specifier
			);
			// blobify it
			const blobUrl = await blobifyModule(resolved);
			return {
				full,
				replacement: `import ${bindings} from "${blobUrl}"`
			};
		})
	);

	for (const { full, replacement } of rewritten) {
		code = code.replace(full, replacement);
	}

	AppsTimeStamp(`Rewrite imports of code at ${currentPath}`, start);

	return code;
}

/**
 *
 * @param - path The path to return the imports of
 * @returns the exports of the path
 */
export async function include(path: string): Promise<any> {
	const blobUrl = await blobifyModule(path);
	return await import(blobUrl);
}
