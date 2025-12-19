import ConstellationKernel from "../..//kernel.js";
import {
	ConstellationFileIndexv1,
	ConstellationFileIndexv2,
	FileIndex
} from "./definitions.js";
import { userspaceFstoKernelFs } from "../fstranslate.js";
import { FilesystemInterface } from "/System/security/components/env/components/fs.js";

export async function tcupkgv1(
	fs: ConstellationKernel["fs"],
	idxFile: ConstellationFileIndexv1,
	directory: string
) {
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
		const relative = fs.resolve(directory, path);

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
				const result = fs.writeFile(relative, String(data));

				writingWaitlist.push([relative, result]);
				break;
			}
			case "binary": {
				// write the data-url to disk, since it's stored how we manage binary files anyway
				const result = fs.writeFile(
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

export async function tcupkgv2(
	fs: ConstellationKernel["fs"],
	idxFile: ConstellationFileIndexv2,
	directory: string
) {
	if (idxFile.version !== 2) {
		throw new Error("Only idxv2 files are supported!");
	}

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
		const relative = fs.resolve(directory, path);

		// Just the file contents here
		const result = fs.writeFile(relative, data.contents);

		// wait later
		writingWaitlist.push([relative, result]);
	}

	debug(`Waiting for files to write for idx unpackage at ${directory}`);
	for (const promise of writingWaitlist) {
		debug(`Waiting for `, promise);
		await promise[1];
	}

	debug(`Files have written for idx unpackage at ${directory}`);
}

export async function tcupkg(
	fs: ConstellationKernel["fs"],
	idxFile: FileIndex,
	directory: string
) {
	if ("version" in idxFile) {
		// version other
		switch (idxFile.version) {
			case 2:
				return await tcupkgv2(fs, idxFile, directory);
			default:
				throw new Error(`Unknown idxVersion ${idxFile.version}.`);
		}
	} else {
		// version 1
		return await tcupkgv1(fs, idxFile, directory);
	}
}

export async function userspaceUnpackage(
	fs: FilesystemInterface,
	idxFile: FileIndex,
	directory: string
) {
	await tcupkg(userspaceFstoKernelFs(fs), idxFile, directory);
}
