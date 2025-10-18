import ConstellationKernel from "../..//kernel.js";
import { ConstellationFileIndex } from "./definitions.js";

export async function tcupkg(
	ConstellationKernel: ConstellationKernel,
	idxFile: ConstellationFileIndex,
	directory: string
) {
	// filesystem library so it's easy to port tcupkg.
	const fs = {
		mkdir: ConstellationKernel.fs.mkdir.bind(ConstellationKernel.fs),
		resolve: ConstellationKernel.fs.resolve.bind(ConstellationKernel.fs),
		writeFile: ConstellationKernel.fs.writeFile.bind(ConstellationKernel.fs)
	};

	const writingWaitlist: [string, Promise<any>][] = [];

	// tcupkg debugger
	//const debug = ConstellationKernel.lib.logging.debug.bind(
	//	ConstellationKernel.lib.logging,
	//	"/System/lib/packaging/tcupkg.js"
	//);
	const debug = (...args: any[]) => {};

	debug(`Creating ${directory}`);
	await fs.mkdir(directory);

	// create directories
	for (const path of idxFile.directories) {
		const relative = fs.resolve(directory, path);

		debug(`Creating ${relative}`);
		await fs.mkdir(relative);
	}

	// write files
	for (const path in idxFile.files) {
		// relative path
		const data = idxFile.files[path];

		// absolute path
		const relative = ConstellationKernel.fs.resolve(directory, path);

		// file-extension determined file type
		let type: "string" | "binary";
		if (typeof data == "string") {
			type = "string";
		} else {
			type = data.type;
		}

		debug(`Writing ${relative}`);
		switch (type) {
			case "string": {
				// Just the file contents here
				const result = ConstellationKernel.fs.writeFile(
					relative,
					String(data)
				);

				writingWaitlist.push([relative, result]);
				break;
			}
			case "binary": {
				// write the data-url to disk, since it's stored how we manage binary files anyway
				const result = ConstellationKernel.fs.writeFile(
					relative,
					// @ts-expect-error
					data.data
				);

				writingWaitlist.push([relative, result]);
				break;
			}
			default:
				throw new Error(
					"Unknown key type within files object: '" + type + "'"
				);
		}
	}

	debug(`Waiting for files to write for idx unpackage at ${directory}`);
	for (const promise of writingWaitlist) {
		debug(`Waiting for `, promise);
		await promise[1];
	}

	debug(`Files have written for idx unpackage at ${directory}`);
}
