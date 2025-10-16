import { defaultConfiguration } from "../constellation.config.js";
import { isCommandLine } from "../getPlatform.js";
import { DevToolsColor, performanceLog } from "../lib/debug.js";
import {
	ApiError,
	BrowserFS,
	FileSystemConfiguration,
	Stats
} from "./BrowserFsTypes.js";
import {
	getParentDirectory,
	normaliseDirectory,
	resolveDirectory
} from "./fspath.js";
import { relative } from "./nodepath.js";

function filesystemTimestamp(
	label: string,
	start: DOMHighResTimeStamp,
	colour: DevToolsColor = "secondary"
) {
	performanceLog(label, start, "FileSystemManager", colour);
}

const start = performance.now();

const startDownloadBrowserFS = performance.now();

const BrowserFsExports = await import("./browserfs.js");
const BrowserFS: BrowserFS = BrowserFsExports.default();

filesystemTimestamp("Download and initalise BrowserFS", startDownloadBrowserFS);

const configureBrowserFS = performance.now();
await new Promise((resolve: Function) => {
	let fs: FileSystemConfiguration["fs"] = "IndexedDB";
	if (isCommandLine) fs = "InMemory";

	BrowserFS.configure({ fs, options: {} }, (e?: ApiError | null) => {
		if (e) {
			console.error("PREBOOT:LOADFS", e);
		}
		console.log("Initialised Browser Filesystem.");
		filesystemTimestamp("Configure BrowserFS", configureBrowserFS);
		resolve();
	});
});

const fs = BrowserFS.BFSRequire("fs");
if (defaultConfiguration.dynamic.isDevmode) {
	(window as any).BFS = fs;
}

const writeFile = async (directory: string, content: string) => {
	const start = performance.now();
	let written = false;

	await fs.writeFile(directory, content, () => {
		written = true;
	});

	return new Promise((resolve) => {
		const interval = setInterval(() => {
			if (written == true) {
				filesystemTimestamp(`writeFile ${directory}`, start);

				clearInterval(interval);
				resolve(undefined);
				return;
			}
		});
	});
};

const readFile = async (directory: string): Promise<string | undefined> => {
	const start = performance.now();

	return new Promise((resolve: Function) =>
		fs.readFile(directory, "utf8", (e: any, rv?: string) => {
			filesystemTimestamp(`readFile ${directory}`, start);
			resolve(rv);
		})
	);
};

const rename = async (oldPath: string, newPath: string): Promise<void> => {
	const start = performance.now();

	return new Promise((resolve, reject) => {
		fs.rename(oldPath, newPath, (err: any) => {
			filesystemTimestamp(`rename ${oldPath} → ${newPath}`, start);
			if (err) {
				console.warn(`rename failed: ${oldPath} → ${newPath}`, err);
				reject(err);
			} else {
				resolve();
			}
		});
	});
};

const readdir = async (directory: string): Promise<string[]> => {
	const start = performance.now();

	return new Promise((resolve: Function) =>
		fs.readdir(directory, (e: any, rv?: string[]) => {
			filesystemTimestamp(`readdir ${directory}`, start);
			resolve(rv);
		})
	);
};
const mkdir = async (directory: string): Promise<undefined> => {
	const start = performance.now();

	const parentDirectory = getParentDirectory(directory);

	const parentListing = await readdir(parentDirectory);
	if (parentListing == undefined) {
		throw new Error(
			`Parent directory, ${parentDirectory}, doesn't exist! (Creating ${directory})`
		);
	}
	if (parentListing.includes(directory.textAfter(parentDirectory))) {
		// already exists

		filesystemTimestamp(
			`mkdir ${directory} - failed (already exists)`,
			start
		);

		return new Promise((resolve: Function) => resolve);
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
			filesystemTimestamp(`mkdir ${directory}`, start);
			resolve();
		});
	});
};

const stat = async (directory: string): Promise<Stats | undefined> => {
	const start = performance.now();

	return new Promise((resolve) => {
		fs.stat(directory, (_: any, data?: Stats) => {
			filesystemTimestamp(`stat ${directory}`, start);
			resolve(data);
		});
	});
};
const rmdir = async (directory: string): Promise<any> => {
	const start = performance.now();

	return new Promise((resolve: Function) =>
		fs.rmdir(directory, () => {
			filesystemTimestamp(`rmdir ${directory}`, start);
			resolve();
		})
	);
};
const unlink = async (directory: string): Promise<any> => {
	const start = performance.now();

	return new Promise((resolve: Function) => {
		fs.unlink(directory, () => {
			filesystemTimestamp(`unlink ${directory}`, start);
			resolve();
		});
	});
};
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
		return this.rootPoint + path;
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

export async function fsLoaded() {
	await new Promise((resolve: Function) => {
		let interval = setInterval(() => {
			if (typeof BrowserFS !== "undefined") {
				clearInterval(interval);
				resolve();
				return;
			}
		});
	});
}

filesystemTimestamp("Startup of src/io/fs.ts", start, "primary");
