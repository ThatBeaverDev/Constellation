// @ts-expect-error
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

export const relative = (base = "/", target: string) => {
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

const main = {
	...fs,

	writeFile,
	readFile,
	readdir,
	relative,
	stat
};

export default main;
