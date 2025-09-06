import { FilesystemAPI } from "../fs/fs.js";
import {
	getParentDirectory,
	resolveDirectory as resolvePath
} from "../fs/fspath.js";
import { AppsTimeStamp, ProgramRuntime } from "./runtime.js";

export class importRewriter {
	constructor(fs: FilesystemAPI, runtime: ProgramRuntime) {
		this.fs = fs;
		this.#runtime = runtime;
	}

	fs: FilesystemAPI;
	#runtime: ProgramRuntime;

	/**
	 * a Cache of blobs which *never* invalidates! this will surely cause a some problems.
	 */
	blobCache = new Map<string, string>();

	/**
	 *
	 * @param - path The directory which should be converted to a blob, assuming it's not cached.
	 * @returns The contents of the directory, as a blob.
	 */
	async blobifyModule(
		path: string,
		allowCache: boolean = true
	): Promise<string> {
		if (allowCache) {
			if (this.blobCache.has(path)) return this.blobCache.get(path)!;
		}

		let code = await this.fs.readFile(path);

		if (code == undefined) {
			throw new Error(`File at ${path} doesn't exist.`);
		}

		// Rewrite imports to blob URLs AND include references to env.
		code = await this.processCode(code, path);

		const blob = new Blob([code], { type: "text/javascript" });
		const blobUrl = URL.createObjectURL(blob);

		this.blobCache.set(path, blobUrl);
		return blobUrl;
	}

	async processCode(code: string, directory: string): Promise<string> {
		const rewrittenImports = await this.rewriteImportsAsync(
			code,
			directory
		);
		const envDeclaration = this.includeEnv(rewrittenImports);

		return envDeclaration;
	}

	/**
	 * @param - code the code which import replacements should be applied to
	 * @param - currentPath the directory from which relative imports will be resolved from
	 * @returns the code with all imports resolved to blobs.
	 */
	async rewriteImportsAsync(
		code: string,
		currentPath: string
	): Promise<string> {
		const start = performance.now();

		// regex
		const importRegex = /import\s+(.*?)\s+from\s+["'](.+?)["']/g;

		const rewritten = await Promise.all(
			[...code.matchAll(importRegex)].map(async (match) => {
				const [full, bindings, specifier] = match;

				// resolve it
				let resolved;
				if (specifier.startsWith(".") || specifier.startsWith("/")) {
					// resolve to a path
					resolved = resolvePath(
						getParentDirectory(currentPath),
						specifier
					);
				} else {
					// resolve as a module in `/System/CoreLibraries`.
					resolved = resolvePath(
						"/System/CoreLibraries",
						specifier + ".js"
					);
				}

				// blobify it
				const blobUrl = await this.blobifyModule(resolved);
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
	 * Includes a declaration for `env` at the top of the file, while still respecting `import` statements and placing it afterwards.
	 * @param code - The code to add the declaration to.
	 * @returns the provided code, with the declaration.
	 */
	includeEnv(code: string) {
		function findFirstLineAfterImports(code: string) {
			const lines = code.split("\n");
			let i = 0;
			let foundImport = false;

			while (i < lines.length) {
				let line = lines[i].trim();

				if (line === "") {
					i++;
					continue;
				}

				// exit if not an import
				if (!line.startsWith("import")) {
					break;
				}

				foundImport = true;

				// use {} to find the statement ending
				let openBraces = (line.match(/{/g) || []).length;
				let closeBraces = (line.match(/}/g) || []).length;

				while (openBraces > closeBraces && i + 1 < lines.length) {
					i++;
					const nextLine = lines[i];
					openBraces += (nextLine.match(/{/g) || []).length;
					closeBraces += (nextLine.match(/}/g) || []).length;
				}

				i++;
			}

			return foundImport ? i : 0; // return start if there's no imports
		}

		const lines = code.split("\n");
		const afterImports = findFirstLineAfterImports(code);

		const linesWithEnv = [
			...lines.slice(0, afterImports),
			`const env = window.envs.get(${this.#runtime.id});`,
			...lines.slice(afterImports)
		];

		const processedCode = linesWithEnv.join("\n");

		return processedCode;
	}

	/**
	 *
	 * @param - path The path to return the imports of
	 * @returns the exports of the path
	 */
	async include(path: string): Promise<any> {
		const blobUrl = await this.blobifyModule(path);
		return await import(blobUrl);
	}
}
