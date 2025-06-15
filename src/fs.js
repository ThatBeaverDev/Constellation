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
	(e) => {
		if (e) {
			console.error(e);
		}
	}
);

const fs = BrowserFS.BFSRequire("fs");

const writeFile = async (directory, content) => {
	let written = false;

	await fs.writeFile(directory, content, () => {
		written = true;
	});

	console.log(directory, content.split("\n")[0]);

	return new Promise((resolve) => {
		const interval = setInterval(() => {
			if (written == true) {
				clearInterval(interval);
				resolve();
				return;
			}
		});
	});
};

const readFile = async (directory) => {
	let read = false;
	let content = undefined;

	fs.readFile(directory, "utf8", (_, data) => {
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

const readdir = async (directory) => {
	let ls = undefined;
	let listed = false;

	fs.readdir(directory, (_, data) => {
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

const stat = async (directory) => {
	let stats = undefined;
	let ok = false;

	fs.stat(directory, (_, data) => {
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

export const relative = (base = "/", target) => {
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
window.fs = main;

export default main;
