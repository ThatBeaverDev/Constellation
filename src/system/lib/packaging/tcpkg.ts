import ConstellationKernel from "../..//kernel.js";
import { LatestFileIndex } from "./definitions.js";
import { userspaceFstoKernelFs } from "../fstranslate.js";
import { FilesystemInterface } from "/System/security/components/env/components/fs.js";

export async function tcpkg(
	fs: ConstellationKernel["fs"],
	packageDirectory: string
): Promise<LatestFileIndex> {
	// package info
	const pkg: LatestFileIndex = {
		files: {},
		directories: [],
		version: 2
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
					const content = await fs.readFile(dir);
					const stats = await fs.stat(dir);

					if (!content || !stats)
						throw new Error(
							`"Unexpected undefined when reading/statting file at ${dir}`
						);

					pkg.files[relative] = {
						contents: content,

						created: stats.ctime,
						modified: stats.mtime,

						size: stats.size
					};
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

export async function userspacePackage(
	fs: FilesystemInterface,
	directory: string
) {
	return await tcpkg(userspaceFstoKernelFs(fs), directory);
}
