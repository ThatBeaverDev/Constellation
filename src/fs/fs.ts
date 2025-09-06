import { isCommandLine } from "../getPlatform.js";
import { DevToolsColor, performanceLog } from "../lib/debug.js";
import { ApiError, BrowserFS } from "./BrowserFsTypes.js";
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
	if (isCommandLine) {
		BrowserFS.configure(
			{
				fs: "InMemory",
				options: {}
			},
			(e?: ApiError | null) => {
				if (e) {
					console.error("PREBOOT:LOADFS", e);
				}
				console.log("Initialised Browser Filesystem.");
				filesystemTimestamp("Configure BrowserFS", configureBrowserFS);
				resolve();
			}
		);
	} else {
		BrowserFS.configure(
			{ fs: "IndexedDB", options: {} },
			(e?: ApiError | null) => {
				if (e) {
					console.error("PREBOOT:LOADFS", e);
				}
				console.log("Initialised Browser Filesystem.");
				filesystemTimestamp("Configure BrowserFS", configureBrowserFS);
				resolve();
			}
		);
	}
});

const fs = BrowserFS.BFSRequire("fs");

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

const renameFile = async (oldPath: string, newPath: string): Promise<void> => {
	const start = performance.now();

	return new Promise((resolve, reject) => {
		fs.rename(oldPath.toString(), newPath.toString(), (err: any) => {
			filesystemTimestamp(`renameFile ${oldPath} → ${newPath}`, start);
			if (err) {
				console.warn(`renameFile failed: ${oldPath} → ${newPath}`, err);
				reject(err);
			} else {
				resolve();
			}
		});
	});
};

const rename = async (oldPath: string, newPath: string): Promise<void> => {
	const type = await stat(oldPath);
	if (!type) return;

	const isDir = type.isDirectory();

	if (isDir) {
		await mkdir(newPath).catch((e: Error) => {
			throw e;
		});

		const entries = await readdir(oldPath);

		for (const entry of entries) {
			const from = resolveDirectory(oldPath, entry);
			const to = resolveDirectory(newPath, entry);
			await rename(from, to);
		}

		await new Promise<void>((resolve, reject) => {
			fs.rmdir(oldPath.toString(), (err: any) => {
				filesystemTimestamp(
					`rmdir ${oldPath.toString()}`,
					performance.now()
				);
				if (err) reject(err);
				else resolve();
			});
		});
	} else {
		await renameFile(oldPath, newPath);
	}
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

const stat = async (directory: string): Promise<any> => {
	const start = performance.now();

	return new Promise((resolve) => {
		fs.stat(directory, (_: any, data: any) => {
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

	async stat(directory: string) {
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
