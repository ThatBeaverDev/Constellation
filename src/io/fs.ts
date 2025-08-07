import { setStatus } from "../constellation.config.js";
import { DevToolsColor, performanceLog } from "../lib/debug.js";
import { ApiError, BrowserFS } from "./browserfs.js";

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
	const segments = directory.split("/").filter((section) => section !== "");

	if (segments.length == 0 || segments.length == 1) {
		return true;
	} else {
		return false;
	}
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

export const readFile = async (
	directory: string
): Promise<string | undefined> => {
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
		fs.rename(oldPath, newPath, (err: any) => {
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
			const from = resolve(oldPath, entry);
			const to = resolve(newPath, entry);
			await rename(from, to);
		}

		await new Promise<void>((resolve, reject) => {
			fs.rmdir(oldPath, (err: any) => {
				filesystemTimestamp(`rmdir ${oldPath}`, performance.now());
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

	if (isRoot(directory)) {
		filesystemTimestamp(
			`mkdir ${directory} - failed (no new children of root)`,
			start,
			"error"
		);
		throw new Error("Directories cannot be created under root.");
	}

	const parentDirectory = directory.textBeforeLast("/");
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
		fs.mkdir(directory, (e: any) => {
			filesystemTimestamp(`mkdir ${directory}`, start);
			resolve();
		});
	});
};

const stat = async (directory: string): Promise<any> => {
	const start = performance.now();
	let stats: any;
	let ok = false;

	fs.stat(directory, (_: any, data: any) => {
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
export const resolve = (base = "/", target: string) => {
	if (target.startsWith("/")) return target;

	const baseParts = base.split("/").filter(Boolean);
	const targetParts = target.split("/");

	for (const part of targetParts) {
		if (part === "." || part === "") continue;
		if (part === "..") {
			if (baseParts.length > 0) baseParts.pop();
		} else {
			baseParts.push(part);
		}
	}

	return "/" + baseParts.join("/");
};
const normalize = (path: string) =>
	path.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
export function relative(from: string, to: string) {
	from = normalize(from);
	to = normalize(to);

	if (from === to) return "";

	const fromParts = from.split("/").filter(Boolean);
	const toParts = to.split("/").filter(Boolean);

	// find the point where both paths are the same
	let commonLength = 0;
	while (
		commonLength < fromParts.length &&
		commonLength < toParts.length &&
		fromParts[commonLength] === toParts[commonLength]
	) {
		commonLength++;
	}

	// steps to ascend from common ancestor
	const upSteps = fromParts.length - commonLength;
	const up = Array(upSteps).fill("..");

	// steps to descend to the target
	const down = toParts.slice(commonLength);

	// merge steps to get one set of steps
	const result = [...up, ...down].join("/");
	return result || ".";
}

/*

tcpkg /System /sys.idx

*/

const main = {
	...fs,

	writeFile,
	readFile,
	readdir,
	resolve,
	relative,
	normalize,
	stat,
	rename,
	mkdir,
	rmdir,
	unlink
};

export default main;

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
