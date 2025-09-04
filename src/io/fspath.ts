import {
	resolve as noderesolve,
	relative as noderelative,
	normalize
} from "./nodepath.js";

/**
 * @returns Parent directory of the current directory.
 */
export function getParentDirectory(path: string): string {
	const parent = path.replace(/\/[^\/]+\/?$/, "") || "/";
	return parent;
}

export function isAbsoluteDirectory(path: string) {
	return path.charAt(0) === "/";
}

export function normaliseDirectory(path: string): string {
	return normalize(path);
}

/**
 * Resolves a sequence of paths or path segments into an absolute path.
 * @param {string} base - Original path
 * @param {string} target - Text to resolve from the base
 * @returns {string} resolved path
 */
export function resolveDirectory(base: string, ...targets: string[]): string {
	return noderesolve(base, ...targets.map((item) => item.toString()));
}
