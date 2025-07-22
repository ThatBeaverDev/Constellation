let bfs: Function | undefined;

const isDev = window.location.hostname == "localhost";
const bfsName = isDev ? "browserfs.js" : "browserfs.min.js";

const bfsCode = await (await fetch(`/src/lib/external/${bfsName}`)).text();

bfs = new Function(bfsCode);
await bfs(); // start browserFS

// @ts-expect-error
const BrowserFS = window.BrowserFS;
// @ts-expect-error
window.BrowserFS = undefined;
// @ts-expect-error
delete window.BrowserFS;

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
	(e: Error) => {
		if (e) {
			console.error(e);
		}
	}
);

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
	let written = false;

	await fs.writeFile(directory, content, () => {
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

const readFile = async (directory: string): Promise<string | undefined> => {
	return new Promise((resolve: Function) =>
		fs.readFile(directory, "utf8", (e: any, data: string) => {
			resolve(data);
		})
	);
};

const renameFile = async (
	oldDirectory: string,
	newDirectory: string
): Promise<undefined> => {
	return new Promise((resolve: Function) =>
		fs.rename(oldDirectory, newDirectory, (e: any, data: any) => {
			resolve();
		})
	);
};
const rename = async (
	oldDirectory: string,
	newDirectory: string
): Promise<undefined> => {
	const type = await stat(oldDirectory);
	if (type == undefined) return;

	const isDir = type.isDirectory();

	if (isDir) {
		await mkdir(newDirectory);

		const list = await readdir(oldDirectory);

		for (const item of list) {
			const resolvedOld = resolve(oldDirectory, item);
			const resolvedNew = resolve(newDirectory, item);

			await rename(resolvedOld, resolvedNew);
		}

		await fs.rmdir(oldDirectory);
	} else {
		return renameFile(oldDirectory, newDirectory);
	}
};

const readdir = async (directory: string): Promise<string[]> => {
	return new Promise((resolve: Function) =>
		fs.readdir(directory, (e: any, data: string[]) => {
			resolve(data);
		})
	);
};
const mkdir = async (directory: string): Promise<undefined> => {
	if (isRoot(directory))
		throw new Error("Directories cannot be created under root.");

	return new Promise((resolve: Function) => {
		fs.mkdir(directory, (e: any) => {
			resolve();
		});
	});
};

const stat = async (directory: string): Promise<any> => {
	let stats: any;
	let ok = false;

	fs.stat(directory, (_: any, data: any) => {
		stats = data;
		ok = true;
	});

	return new Promise((resolve) => {
		const interval = setInterval(() => {
			if (ok == true) {
				clearInterval(interval);
				resolve(stats);
				return;
			}
		});
	});
};

const resolve = (base = "/", target: string) => {
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
function relative(from: string, to: string) {
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
	mkdir
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
