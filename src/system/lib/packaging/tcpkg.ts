import ConstellationKernel from "../..//kernel.js";
import { ConstellationFileIndex } from "./definitions.js";
import mimes from "../../CoreLibraries/mimes/mimes.js";

function getMimeType(extension: string): string | null {
	for (const type in mimes) {
		const extensions = mimes[type];
		if (extensions.includes(extension)) {
			return type;
		}
	}

	return null;
}

export async function tcpkg(
	ConstellationKernel: ConstellationKernel,
	packageDirectory: string
) {
	// filesystem library so it's easy to port tcpkg.
	const fs = {
		readdir: ConstellationKernel.fs.readdir.bind(ConstellationKernel.fs),
		resolve: ConstellationKernel.fs.resolve.bind(ConstellationKernel.fs),
		stat: ConstellationKernel.fs.stat.bind(ConstellationKernel.fs),
		relative: ConstellationKernel.fs.relative.bind(ConstellationKernel.fs),
		readFile: ConstellationKernel.fs.readFile.bind(ConstellationKernel.fs)
	};

	// package info
	const pkg: ConstellationFileIndex = {
		files: {},
		directories: []
	};

	// walk the folder
	async function walk(directory: string) {
		const contents = await fs.readdir(directory);

		for (const item of contents) {
			// determine the absolute path of the file
			const dir = fs.resolve(directory, item);

			// determine if the path is a directory or not
			const stat = await fs.stat(dir);
			if (stat == undefined)
				throw new Error(
					"Stat is undefined for a file that *should* exist?"
				);

			const isDir = stat.isDirectory();

			// get the *relative* path
			const relative: string = fs.relative(packageDirectory, dir);

			if (isDir) {
				// folders can simply be added to the directories list
				pkg.directories.push(relative);
				await walk(dir);
			} else {
				// files require MIME-type to determine if they are binary or not, because binary images are managed as DATA-URIs.

				try {
					// guess the mime type from the file extension
					const type =
						getMimeType(dir.textAfterAll(".")) ?? "text/plain";

					const isText =
						type.startsWith("text/") ||
						type.includes("xml") ||
						type.includes("javascript") ||
						type.includes("typescript") ||
						type.includes("json");

					if (isText) {
						const content = await fs.readFile(dir);

						if (content == undefined)
							throw new Error(
								`"Unexpected undefined when reading file at ${dir}`
							);

						pkg.files[relative] = content;
					} else {
						// encode to dataURI
						const content = await fs.readFile(dir);

						if (content == undefined)
							throw new Error(
								`"Unexpected undefined when reading file at ${dir}`
							);

						const b64 = btoa(content);
						const uri = `data:${type};base64,${b64}`;

						pkg.files[relative] = {
							type: "binary",
							data: uri
						};
					}
				} catch (e) {
					throw new Error(
						`Error ${e} occurred when packaging ${dir}. it has not been included in the index.`
					);
				}
			}
		}
	}

	try {
		await walk(packageDirectory);
	} catch (e) {
		throw e;
	}

	return pkg;
}
