import { setStatus } from "../constellation.config.js";
import { DevToolsColor, performanceLog } from "../lib/debug.js";
import { ApiError, BrowserFS } from "./browserfs.js";
import {
	getParentDirectory,
	normaliseDirectory,
	resolveDirectory
} from "./fspath.js";
import { relative } from "./nodepath.js";

export function filesystemTimestamp(
	label: string,
	start: DOMHighResTimeStamp,
	colour: DevToolsColor = "secondary"
) {
	performanceLog(label, start, "FileSystemManager", colour);
}

const start = performance.now();
let bfs: Function | undefined;

const isDev = window.location.hostname == "localhost";
const bfsName = isDev ? "browserfs.js" : "browserfs.min.js";

const startDownloadBrowserFS = performance.now();
const bfsCode = await (await fetch(`/src/lib/external/${bfsName}`)).text();
filesystemTimestamp("Download BrowserFS", startDownloadBrowserFS);

const startInitBrowserFS = performance.now();
bfs = new Function(bfsCode);
await bfs(); // start browserFS

// @ts-expect-error
const BrowserFS: BrowserFS = window.BrowserFS;
//// @ts-expect-error
//window.BrowserFS = undefined;
//// @ts-expect-error
//delete window.BrowserFS;

filesystemTimestamp("Initialise BrowserFS", startInitBrowserFS);

let hasInitialised = false;
setStatus("Waiting for BrowserFS...");

BrowserFS.configure(
	{
		fs: "MountableFileSystem",
		options: {
			"/": {
				fs: "IndexedDB",
				options: {
					storeName: "root"
				}
			},
			"/System": {
				fs: "IndexedDB",
				options: {
					storeName: "system"
				}
			},
			"/Users": {
				fs: "IndexedDB",
				options: {
					storeName: "users"
				}
			},
			"/Applications": {
				fs: "IndexedDB",
				options: {
					storeName: "sharedApps"
				}
			},
			"/Temporary": {
				fs: "InMemory"
			}
		}
	},
	(e?: ApiError | null) => {
		if (e) {
			console.error(e);
		}
		console.log("initialised innit.");
		hasInitialised = true;
	}
);

await new Promise((resolve: Function) => {
	let interval = setInterval(() => {
		if (hasInitialised == true) {
			clearInterval(interval);
			resolve();
			return;
		}
	});
});

const fs = BrowserFS.BFSRequire("fs");

function isRoot(directory: string) {
	const segments = directory
		.toString()
		.split("/")
		.filter((section) => section !== "");

	if (segments.length == 0 || segments.length == 1) {
		return true;
	} else {
		return false;
	}
}

const writeFile = async (directory: string, content: string) => {
	const start = performance.now();
	let written = false;

	await fs.writeFile(directory.toString(), content, () => {
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

export const readFile = async (
	directory: string
): Promise<string | undefined> => {
	const start = performance.now();

	return new Promise((resolve: Function) =>
		fs.readFile(directory.toString(), "utf8", (e: any, rv?: string) => {
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
		fs.readdir(directory.toString(), (e: any, rv?: string[]) => {
			filesystemTimestamp(`readdir ${directory}`, start);
			resolve(rv);
		})
	);
};
const mkdir = async (directory: string): Promise<undefined> => {
	const start = performance.now();

	if (isRoot(directory)) {
		filesystemTimestamp(
			`mkdir ${directory} - failed (no new children of root)`,
			start,
			"error"
		);
		throw new Error("Directories cannot be created under root.");
	}

	const parentDirectory = getParentDirectory(directory);
	const parent = await stat(parentDirectory);
	if (parent == undefined)
		throw new Error(
			`Parent directory, ${parentDirectory}, doesn't exist! (Creating ${directory})`
		);
	if (!parent.isDirectory())
		throw new Error(
			`Parent directory, ${parentDirectory}, doesn't exist! (Creating ${directory})`
		);

	return new Promise((resolve: Function) => {
		fs.mkdir(directory.toString(), (e: any) => {
			filesystemTimestamp(`mkdir ${directory}`, start);
			resolve();
		});
	});
};

const stat = async (directory: string): Promise<any> => {
	const start = performance.now();
	let stats: any;
	let ok = false;

	fs.stat(directory.toString(), (_: any, data: any) => {
		stats = data;
		ok = true;
	});

	return new Promise((resolve) => {
		const interval = setInterval(() => {
			if (ok == true) {
				filesystemTimestamp(`stat ${directory}`, start);
				clearInterval(interval);
				resolve(stats);
				return;
			}
		});
	});
};
const rmdir = async (directory: string): Promise<any> => {
	const start = performance.now();

	return new Promise((resolve: Function) =>
		fs.rmdir(directory.toString(), () => {
			filesystemTimestamp(`rmdir ${directory}`, start);
			resolve();
		})
	);
};
const unlink = async (directory: string): Promise<any> => {
	const start = performance.now();

	return new Promise((resolve: Function) => {
		fs.unlink(directory.toString(), () => {
			filesystemTimestamp(`unlink ${directory}`, start);
			resolve();
		});
	});
};

const main = {
	...fs,

	writeFile,
	readFile,
	readdir,
	resolve: resolveDirectory,
	relative,
	normalize: normaliseDirectory,
	stat,
	rename,
	mkdir,
	rmdir,
	unlink
};

export default main;

export class FilesystemAPI {
	constructor(public rootPoint: string) {}
	async init() {}

	async writeFile(directory: string, content: string) {
		const realpath = this.rootPoint + directory;
		return await writeFile(realpath, content);
	}

	async readFile(directory: string) {
		const realpath = this.rootPoint + directory;
		return await readFile(realpath);
	}

	async readdir(directory: string) {
		const realpath = this.rootPoint + directory;
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

	async stat(directory: string) {
		const realpath = this.rootPoint + directory;
		return await stat(realpath);
	}

	async mkdir(directory: string) {
		const realpath = this.rootPoint + directory;
		return await mkdir(realpath);
	}

	async rmdir(directory: string) {
		const realpath = this.rootPoint + directory;
		return await rmdir(realpath);
	}

	async unlink(directory: string) {
		const realpath = this.rootPoint + directory;
		return await unlink(realpath);
	}
}

export async function fsLoaded() {
	await new Promise((resolve: Function) => {
		let interval = setInterval(() => {
			if (typeof bfs == "function") {
				clearInterval(interval);
				resolve();
				return;
			}
		});
	});
}

// @ts-expect-error
window.realFS = main;

filesystemTimestamp("Startup of src/io/fs.ts", start, "primary");
