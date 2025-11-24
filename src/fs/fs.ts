import { defaultConfiguration } from "../system/constellation.config.js";
import { isCommandLine } from "../system/getPlatform.js";
import {
	ApiError,
	BrowserFS,
	FileSystemConfiguration,
	FSModule,
	Stats
} from "./BrowserFsTypes";
import {
	getParentDirectory,
	normaliseDirectory,
	resolveDirectory
} from "../system/io/fspath.js";
import { relative } from "../system/io/nodepath.js";

/* ------------------------------------------------------------- Constants and Timestamp Function ------------------------------------------------------------- */

let commandLineBase = "";

if (isCommandLine) {
	commandLineBase = process.cwd() + "/.fs";
}

let fs: FSModule;
if (!isCommandLine) {
	/* ------------------------------------------------------------- Download BrowserFS ------------------------------------------------------------- */

	const BrowserFsExports = await import("./browserfs.js");
	const BrowserFS: BrowserFS = BrowserFsExports.default();

	/* ------------------------------------------------------------- Configure BrowserFS ------------------------------------------------------------- */

	await new Promise((resolve: Function) => {
		let fs: FileSystemConfiguration["fs"] = "IndexedDB";
		if (isCommandLine) fs = "InMemory";

		BrowserFS.configure({ fs, options: {} }, (e?: ApiError | null) => {
			if (e) {
				console.error("PREBOOT:LOADFS", e);
			}
			console.log("Initialised Browser Filesystem.");
			resolve();
		});
	});

	/* ------------------------------------------------------------- Get Filesytem Interface ------------------------------------------------------------- */

	fs = BrowserFS.BFSRequire("fs");
} else {
	// @ts-expect-error // it's fine
	fs = await import("node:fs");
}

/* ------------------------------------------------------------- Write File Function ------------------------------------------------------------- */

const writeFile = async (directory: string, content: string) => {
	let written = false;

	fs.writeFile(directory, content, () => {
		written = true;
	});

	return new Promise((resolve) => {
		const interval = setInterval(() => {
			if (written == true) {
				clearInterval(interval);
				resolve(undefined);
				return;
			}
		});
	});
};

/* ------------------------------------------------------------- Read File Function ------------------------------------------------------------- */

const readFile = async (directory: string): Promise<string | undefined> => {
	return new Promise((resolve: Function) =>
		fs.readFile(directory, "utf8", (e: any, rv?: string) => {
			resolve(rv);
		})
	);
};

/* ------------------------------------------------------------- Rename File/Folder Function ------------------------------------------------------------- */

const rename = async (oldPath: string, newPath: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		fs.rename(oldPath, newPath, (err: any) => {
			if (err) {
				console.warn(`rename failed: ${oldPath} → ${newPath}`, err);
				reject(err);
			} else {
				resolve();
			}
		});
	});
};

/* ------------------------------------------------------------- List Directory Function ------------------------------------------------------------- */

const readdir = async (directory: string): Promise<string[]> => {
	return new Promise((resolve: Function) =>
		fs.readdir(directory, (e: any, rv?: string[]) => {
			resolve(rv);
		})
	);
};

/* ------------------------------------------------------------- Create Directory Function ------------------------------------------------------------- */

const mkdir = async (directory: string): Promise<undefined> => {
	const parentDirectory = getParentDirectory(directory);

	const parentListing = await readdir(parentDirectory);

	if (parentListing == undefined) {
		throw new Error(
			`Parent directory, ${parentDirectory}, doesn't exist! (Creating ${directory})`
		);
	}
	if (parentListing.includes(directory.textAfter(parentDirectory))) {
		// already exists

		return new Promise((resolve: Function) => {
			resolve();
		});
	}

	const parent = await stat(parentDirectory);
	if (parent == undefined)
		throw new Error(
			`Parent directory, ${parentDirectory}, doesn't exist! (Creating ${directory})`
		);
	if (!parent.isDirectory())
		throw new Error(
			`Parent directory, ${parentDirectory}, is not a directory! (Creating ${directory})`
		);

	return new Promise((resolve: Function) => {
		fs.mkdir(directory, (e: any) => {
			resolve();
		});
	});
};

/* ------------------------------------------------------------- Stat File / Folder Function ------------------------------------------------------------- */

const stat = async (directory: string): Promise<Stats | undefined> => {
	return new Promise((resolve) => {
		fs.stat(directory, (_: any, data?: Stats) => {
			resolve(data);
		});
	});
};

/* ------------------------------------------------------------- Delete Directory Function ------------------------------------------------------------- */

const rmdir = async (directory: string): Promise<any> => {
	return new Promise((resolve: Function) =>
		fs.rmdir(directory, () => {
			resolve();
		})
	);
};

/* ------------------------------------------------------------- Delete File Function ------------------------------------------------------------- */

const unlink = async (directory: string): Promise<any> => {
	return new Promise((resolve: Function) => {
		fs.unlink(directory, () => {
			resolve();
		});
	});
};

/* ------------------------------------------------------------- Copy Folder Function ------------------------------------------------------------- */

/**
 * Recursively copies a file or directory to another location
 * @param oldPath - Path to input
 * @param newPath - Path to destinationo
 */
function copyRecursively(oldPath: string, newPath: string): Promise<void> {
	return new Promise((resolve, reject) => {
		fs.stat(oldPath, (error, stats) => {
			if (error) return reject(error);
			if (stats == undefined) return reject();

			if (stats.isDirectory()) {
				// destination exists
				fs.mkdir(newPath, { recursive: true } as any, (error) => {
					if (error && error.code !== "EEXIST") return reject(error);

					fs.readdir(oldPath, (error, files) => {
						if (error) return reject(error);
						if (files == undefined) return reject();

						Promise.all(
							files.map((file) =>
								copyRecursively(
									oldPath + "/" + file,
									newPath + "/" + file
								)
							)
						)
							.then(() => resolve())
							.catch(reject);
					});
				});
			} else {
				// file
				fs.readFile(oldPath, (err4, data) => {
					if (err4) return reject(err4);

					fs.writeFile(newPath, data, (err5) => {
						if (err5) return reject(err5);
						resolve();
					});
				});
			}
		});
	});
}

if (isCommandLine) {
	// create the .fs folder
	await mkdir("/");
}

if (defaultConfiguration.dynamic.isDevmode) {
	(globalThis as any).BFS = fs;
}

/* ------------------------------------------------------------- FilesystemAPI Class ------------------------------------------------------------- */

export class FilesystemAPI {
	rootPoint: string;
	constructor(rootPoint: string) {
		if (rootPoint !== "/") {
			this.rootPoint = rootPoint;
		} else {
			this.rootPoint = "";
		}
	}
	async init() {
		await fsLoaded();
	}

	/* ---------------------------- Alias Functions to above ---------------------------- */

	async writeFile(directory: string, content: string) {
		const realpath = this.#realDir(directory);
		return await writeFile(realpath, content);
	}

	async readFile(directory: string) {
		const realpath = this.#realDir(directory);
		return await readFile(realpath);
	}

	async readdir(directory: string) {
		const realpath = this.#realDir(directory);

		return await readdir(realpath);
	}

	async rename(oldPath: string, newPath: string) {
		const resolvedOldPath = this.#realDir(oldPath);
		const resolvedNewPath = this.#realDir(newPath);

		return await rename(resolvedOldPath, resolvedNewPath);
	}

	async cp(oldPath: string, newPath: string) {
		const resolvedOldPath = this.#realDir(oldPath);
		const resolvedNewPath = this.#realDir(newPath);

		return await copyRecursively(resolvedOldPath, resolvedNewPath);
	}

	resolve(base: string, ...targets: string[]) {
		return resolveDirectory(base, ...targets);
	}

	relative(from: string, to: string) {
		return relative(from, to);
	}

	normalize(path: string) {
		return normaliseDirectory(path);
	}
	#realDir(path: string) {
		let dir = commandLineBase + this.rootPoint + path;

		if (dir.at(-1) == "/") {
			if (dir == "/") return "/";

			return dir.substring(0, dir.length - 1);
		} else {
			return dir;
		}
	}

	async stat(directory: string): ReturnType<typeof stat> {
		const realpath = this.#realDir(directory);
		return await stat(realpath);
	}

	async mkdir(directory: string) {
		const realpath = this.#realDir(directory);
		return await mkdir(realpath);
	}

	async rmdir(directory: string) {
		const realpath = this.#realDir(directory);
		return await rmdir(realpath);
	}

	async unlink(directory: string) {
		const realpath = this.#realDir(directory);
		return await unlink(realpath);
	}

	async terminate() {}
}

/* ------------------------------------------------------------- Wait for Initialisation Function ------------------------------------------------------------- */

export async function fsLoaded() {
	await new Promise((resolve: Function) => {
		let interval = setInterval(() => {
			if (typeof fs !== "undefined") {
				clearInterval(interval);
				resolve();
				return;
			}
		});
	});
}
