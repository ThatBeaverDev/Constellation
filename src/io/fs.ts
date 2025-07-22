let bfs: Function | undefined;

const bfsCode = await (
	await fetch("/src/lib/external/browserfs.min.js")
).text();

bfs = new Function(bfsCode);
await bfs(); // start browserFS

const BrowserFS = window.BrowserFS;

BrowserFS.configure(
	{
		fs: "MountableFileSystem",
		options: {
			"/": {
				fs: "InMemory"
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

declare global {
	interface Window {
		rawFS: any;
		BrowserFS: any;
	}
}
window.rawFS = fs;

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
	let read = false;
	let content: string;

	fs.readFile(directory, "utf8", (_: any, data: string, _2: any) => {
		read = true;
		content = data;
	});

	return new Promise((resolve) => {
		const interval = setInterval(() => {
			if (read == true) {
				clearInterval(interval);
				resolve(content);
				return;
			}
		});
	});
};

const readdir = async (directory: string) => {
	let ls: string[];
	let listed = false;

	fs.readdir(directory, (_: any, data: string[]) => {
		ls = data;
		listed = true;
	});

	return new Promise((resolve) => {
		const interval = setInterval(() => {
			if (listed == true) {
				clearInterval(interval);
				resolve(ls);
				return;
			}
		});
	});
};

const stat = async (directory: string) => {
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
	stat
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
