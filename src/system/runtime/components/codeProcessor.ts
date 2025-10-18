import { FilesystemAPI } from "../../../fs/fs.js";
import {
	getParentDirectory,
	resolveDirectory as resolvePath
} from "../../io/fspath.js";
import { Terminatable } from "../../kernel.js";
import { ProgramRuntime } from "../runtime.js";
import { AppsTimeStamp } from "./AppsTimeStamp.js";

/**
 * Handles rewriting of import statements into blob URLs,
 * caching module contents and preventing recursive imports.
 */
export class ImportRewriter implements Terminatable {
	#fs: FilesystemAPI;
	#runtime?: ProgramRuntime;

	contentTimeout = 1000;
	contentCache = new Map<
		string,
		{ date: number; contents: string | undefined }
	>();
	blobCache = new Map<string, string>();
	cacheInvalidationLoop: ReturnType<typeof setInterval>;

	constructor(fs: FilesystemAPI, runtime?: ProgramRuntime) {
		this.#fs = fs;
		this.#runtime = runtime;

		// Periodically clear stale cache entries
		this.cacheInvalidationLoop = setInterval(() => {
			const now = Date.now();
			for (const [path, record] of this.contentCache) {
				if (now - record.date > this.contentTimeout) {
					this.contentCache.delete(path);
				}
			}
		}, 1000);
	}

	/** Reads a file with 1s cache lifetime. */
	async readFile(path: string): Promise<string | undefined> {
		const cached = this.contentCache.get(path);
		if (cached) return cached.contents;

		const contents = await this.#fs.readFile(path);
		this.contentCache.set(path, { date: Date.now(), contents });
		return contents;
	}

	/**
	 * Converts a module path to a blob URL, rewriting imports recursively.
	 * Prevents infinite recursion via a shared `visited` set.
	 */
	async blobifyModule(
		path: string,
		useCache = true,
		importer?: string,
		visitedFiles: Set<string> = new Set()
	): Promise<string> {
		if (useCache && this.blobCache.has(path)) {
			return this.blobCache.get(path)!;
		}

		// Recursion detection
		if (visitedFiles.has(path)) {
			const oldList = [...visitedFiles, path];

			const newList = oldList.slice(oldList.indexOf(path), Infinity);

			console.warn("Import recursion detected:", newList.join(" -> "));
			throw new Error(`Recursive import detected for file "${path}".`);
		}
		visitedFiles.add(path);

		const code = await this.readFile(path);
		if (!code) {
			const msg = `File not found: ${path} (imported by ${importer || "unknown"})`;
			console.error(msg);
			throw new Error(msg);
		}

		// Rewrite imports to blob URLs
		const rewrittenCode = await this.processCode(
			code,
			path,
			importer,
			visitedFiles
		);

		// Create a blob for the rewritten code
		const blob = new Blob([rewrittenCode], { type: "text/javascript" });
		const blobUrl = URL.createObjectURL(blob);
		this.blobCache.set(path, blobUrl);

		return blobUrl;
	}

	/** Processes a module’s code and attaches the environment declaration. */
	async processCode(
		code: string,
		currentPath: string,
		importer?: string,
		visitedFiles: Set<string> = new Set()
	): Promise<string> {
		const rewritten = await this.rewriteImportsAsync(
			code,
			currentPath,
			importer,
			visitedFiles
		);
		return this.includeEnv(rewritten);
	}

	/**
	 * Rewrites all import statements in the given code to blob URLs.
	 */
	async rewriteImportsAsync(
		code: string,
		currentPath: string,
		importer?: string,
		visitedFiles: Set<string> = new Set()
	): Promise<string> {
		const start = performance.now();
		const importRegex = /^import\s+(.*?)\s+from\s+["'](.+?)["']/gm;

		// get matches
		const matches = [...code.matchAll(importRegex)];
		if (matches.length === 0) return code;

		// rewrite for each match
		const rewrites = await Promise.all(
			matches.map(async (match) => {
				const [full, bindings, specifier] = match;

				// Resolve import specifier to a real path
				const resolved =
					specifier.startsWith(".") || specifier.startsWith("/")
						? resolvePath(
								getParentDirectory(currentPath),
								specifier
							)
						: resolvePath(
								"/System/CoreLibraries",
								`${specifier}.js`
							);

				// Simple circular check between two modules
				if (resolved === importer) {
					throw new Error(
						`Direct circular import detected between ${currentPath} and ${resolved}.`
					);
				}

				const blobUrl = await this.blobifyModule(
					resolved,
					true,
					currentPath,
					new Set(visitedFiles)
				);
				return {
					full,
					replacement: `import ${bindings} from "${blobUrl}"`
				};
			})
		);

		// Apply all rewrites safely
		for (const { full, replacement } of rewrites) {
			code = code.replace(full, replacement);
		}

		AppsTimeStamp(`Rewrite imports of ${currentPath}`, start);
		return code;
	}

	/**
	 * Injects `env` declaration after the last import statement.
	 */
	includeEnv(code: string): string {
		if (!this.#runtime) return code;

		const lines = code.split("\n");
		let insertIndex = 0;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (!line.startsWith("import")) {
				insertIndex = i;
				break;
			}
		}

		lines.splice(
			insertIndex,
			0,
			`const env = window.envs.get(${this.#runtime.id});`
		);

		return lines.join("\n");
	}

	/** Dynamically includes a module and returns its exports. */
	async include(path: string): Promise<any> {
		const blobUrl = await this.blobifyModule(path);
		return import(blobUrl);
	}

	async terminate(): Promise<void> {
		clearInterval(this.cacheInvalidationLoop);
	}
}
