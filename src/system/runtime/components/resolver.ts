import { FilesystemAPI } from "../../../fs/fs.js";
import blobifier from "../../lib/blobify.js";

interface FileData {
	type: "rawData";
	importTargets: string[];
	contents: string;
	splitContents: string[];
	isResolved: boolean | "stabilising";
}
interface ResolvedFile {
	type: "resolved";
	oldContents: string;
	resolvedContents: string;
	blobURL: string;
}

type ImportStructure = Record<string, FileData>;
type ResolvedStructure = Record<string, ResolvedFile>;

export default class ImportResolver {
	#fs: FilesystemAPI;
	#blobLib: blobifier;
	constructor(fs: FilesystemAPI, blobLib: blobifier) {
		this.#fs = fs;
		this.#blobLib = blobLib;
	}

	async resolve(directory: string) {
		// build the structure
		const structure: ImportStructure = {};
		await this.walk(directory, structure);

		// find leaves
		const leaves = this.findLeaves(structure);

		// resolve leaves
		const resolvedFiles: ResolvedStructure = {};
		this.resolveLeaves(leaves, resolvedFiles);

		// find ripe branches until finished
		while (true) {
			// find ripe branches
			const ripeBranches = this.findRipeBranches(
				structure,
				resolvedFiles
			);

			// exit if there's no more
			if (Object.keys(ripeBranches).length == 0) break;

			// resolve the ripe branches
			this.resolveRipeBranches(ripeBranches, resolvedFiles);
		}

		// check that everything ended up resolved
		const files = Object.keys(structure);
		const resolved = Object.keys(resolvedFiles);

		// sort to insure they have the same order
		files.sort();
		resolved.sort();

		if (files.join("\n") !== resolved.join("\n")) {
			const issueFiles = files.filter((item) => !resolved.includes(item));

			console.debug(
				"The following files were not resolved, as they were part of circular structures:",
				issueFiles
			);
			throw new Error(
				"Circular import structure detected. Imports cannot be resolved."
			);
		}

		return resolvedFiles[directory].blobURL;
	}

	/* ------------------------------ Walking function ------------------------------ */

	/**
	 * Walks the import tree from an originating file, gathering information and writing it to the given structure
	 * @param directory - Directory to start from
	 * @param structure - Structure to write to
	 */
	async walk(directory: string, structure: ImportStructure) {
		// exit if we've already been walked
		if (structure[directory] !== undefined) return;

		// regex
		const importRegex = /^import\s+(.*?)\s+from\s+["'](.+?)["']/gm;

		const code = (await this.#fs.readFile(directory)) || "";

		// get matches
		const matches = [...code.matchAll(importRegex)];

		// get information about imports
		const importsInformation = await Promise.all(
			matches.map(async (match) => {
				const [original, bindings, specifier] = match;

				// Resolve import specifier to a real path
				const resolved =
					specifier.startsWith(".") || specifier.startsWith("/")
						? this.#fs.resolve(
								directory.textBeforeLast("/"),
								specifier
							)
						: this.#fs.resolve(
								"/System/CoreLibraries",
								`${specifier}.js`
							);

				return {
					importTarget: resolved,
					bindings,
					originalImportString: original,
					importString: `import ${bindings} from "${resolved}"`
				};
			})
		);

		const importTargets: string[] = [];
		const splitContents: string[] = [];
		let movingString = String(code);

		// split the string and list the imports
		importsInformation.forEach((item) => {
			importTargets.push(item.importTarget);

			const before = movingString.textBefore(item.originalImportString);
			movingString = movingString.textAfter(item.originalImportString);

			splitContents.push(before, item.importString);
		});
		// push remainder after imports
		splitContents.push(movingString);

		const data: FileData = {
			type: "rawData",
			importTargets,
			contents: code,
			splitContents: splitContents.filter((item) => item.trim() !== ""),
			isResolved: false
		};

		// append to structure
		structure[directory] = data;

		// walk imported files
		for (const dir of data.importTargets) {
			await this.walk(dir, structure);
		}
	}

	/* ------------------------------ Leaf finder function ------------------------------ */

	/**
	 * Finds files that have no imports within the structure
	 * @param structure - Structure to search
	 * @returns - ImportStructure of files with no imports
	 */
	findLeaves(structure: ImportStructure) {
		// find items with no imports (leaves)
		const leaves: ImportStructure = {};

		for (const directory in structure) {
			const fileData = structure[directory];

			if (fileData.importTargets.length == 0) {
				leaves[directory] = fileData;
			}
		}

		return leaves;
	}

	/* ------------------------------ Leaf resolver function ------------------------------ */

	/**
	 * Resolves leaves by simply blobifiying the file contents, since there are no imports
	 * @param leaves - ImportStructure of only leaves
	 * @param resolvedStructure - Structure to write resolved leaves to
	 */
	resolveLeaves(
		leaves: ImportStructure,
		resolvedStructure: ResolvedStructure
	) {
		for (const directory in leaves) {
			const leaf = leaves[directory];

			const blobURL = this.#blobLib.blobify(
				leaf.contents,
				"text/javascript"
			);

			// prevent us considering this again
			leaf.isResolved = true;

			const data: ResolvedFile = {
				type: "resolved",
				oldContents: leaf.contents,
				resolvedContents: leaf.contents,
				blobURL
			};

			resolvedStructure[directory] = data;
		}
	}

	/* ------------------------------ Ripe branch finder function ------------------------------ */

	/**
	 * Finds files that where all imports are now resolved within a structure
	 * @param structure - Structure to search
	 * @param resolvedStructure - Structure of resolved files to check
	 * @returns - ImportStructure of files with all imports already resolved
	 */
	findRipeBranches(
		structure: ImportStructure,
		resolvedStructure: ResolvedStructure
	) {
		// find items with no imports (leaves)
		const ripeBranches: ImportStructure = {};

		for (const directory in structure) {
			const fileData = structure[directory];

			if (fileData.isResolved) continue;

			let isRipe = true;
			for (const target of fileData.importTargets) {
				if (resolvedStructure[target] == undefined) {
					isRipe = false;
					break;
				}
			}

			if (isRipe) {
				ripeBranches[directory] = fileData;
			}
		}

		return ripeBranches;
	}

	/* ------------------------------ Ripe branch resolver function ------------------------------ */

	/**
	 * Resolves Ripe branches by reconstructing the file with new blob URIs and then writing it to the given resolvedStructure
	 * @param leaves - ImportStructure of only ripe branches
	 * @param resolvedStructure - Structure to write resolved ripe branches to
	 */
	resolveRipeBranches(
		ripeBranches: ImportStructure,
		resolvedStructure: ResolvedStructure
	) {
		for (const directory in ripeBranches) {
			const ripeBranch = ripeBranches[directory];

			const split = ripeBranch.splitContents;
			let contents: string = "";
			let importNumber = 0;

			split.forEach((item) => {
				const trimmed = item.trim();

				if (trimmed.startsWith("import")) {
					// this is an import
					const currentImport = importNumber++;
					const target = ripeBranch.importTargets[currentImport];

					const resolvedTarget = resolvedStructure[target];

					const resolved = item.replaceAll(
						target,
						resolvedTarget.blobURL
					);

					contents += resolved;
				} else {
					// just a normal line, append it.
					contents += item;
				}
			});

			const blobURL = this.#blobLib.blobify(contents, "text/javascript");

			// prevent us considering this again
			ripeBranch.isResolved = true;

			const data: ResolvedFile = {
				type: "resolved",
				oldContents: ripeBranch.contents,
				resolvedContents: contents,
				blobURL
			};

			resolvedStructure[directory] = data;
		}
	}

	terminate() {}
}
