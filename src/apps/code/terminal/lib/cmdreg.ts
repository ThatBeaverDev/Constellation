// libraries
const windowsAPI = await env.include("/System/windows.js");
const pathinf = await env.include("/System/CoreLibraries/pathinf.js");

export async function cd(parent: any, directory = "~") {
	const target = env.fs.relative(parent.terminalPath, directory);

	try {
		await ls(parent, target);

		parent.terminalPath = target;
	} catch {
		return directory + " is not a valid directory!";
	}
}

export function pwd(parent: any) {
	return parent.terminalPath;
}

export function clear(parent: any) {
	parent.logs = [];
}

// fs operations
export async function ls(parent: any, directory = ".") {
	const dir = env.fs.relative(parent.terminalPath, directory);

	const list = await env.fs.listDirectory(dir);

	if (!list.ok) {
		console.log(list);
		return list.data;
	}

	const formatted = list.data.join("   ");

	return formatted;
}

export async function cat(parent: any, directory: string) {
	const rel = env.fs.relative(parent.terminalPath, directory);

	const resp = await env.fs.readFile(rel);

	if (!resp.ok) {
		return "File does not exist (or a general filesystem error occurred)";
	}

	const contents = resp.data;

	return contents;
}

export async function touch(parent: any, directory: string) {
	const rel = env.fs.relative(parent.terminalPath, directory);

	const resp = await env.fs.createFile(rel);

	if (!resp.ok) {
		return "Error creating file: " + resp.data;
	}
}

async function treeWalk(
	directory: string,
	prefix: string,
	maxDepth: number,
	depth: number,
	counts: { files: number; dirs: number }
) {
	//if (depth > maxDepth) {
	//	return;
	//}

	let result = "";

	const resp = await env.fs.listDirectory(directory);
	if (!resp.ok) {
		return;
	}
	const contents = resp.data;

	contents.sort();

	for (const i in contents) {
		const file = contents[i];

		if (/*(*/ file[0] !== "." /*) || (obj.showHidden)*/) {
			const parts =
				Number(i) == contents.length - 1
					? ["└── ", "    "]
					: ["├── ", "│   "];

			const dispFile = String(file);

			const asDir = await env.fs.relative(directory, file);

			//if (obj.fullDir) {
			//	dispFile = asDir;
			//};

			const resp = await env.fs.stat(asDir);
			if (!resp.ok) {
				continue;
			}
			const isDir = resp.data.isDirectory();

			if (isDir) {
				result += prefix + parts[0] + dispFile + `\n`;
				counts.dirs++;
				result += await treeWalk(
					asDir,
					prefix + parts[1],
					maxDepth,
					depth + 1,
					counts
				);
			} else {
				/*if (!obj.dirOnly) {*/
				result += prefix + parts[0] + dispFile + `\n`;
				/*};*/
				counts.files++;
			}
		}
	}

	return result;
}

export async function tree(parent: any, directory = ".") {
	const dir = env.fs.relative(parent.terminalPath, directory);

	let result = dir + "\n";

	const counts = {
		files: 0,
		dirs: 0
	};

	result += await treeWalk(dir, "", Infinity, 0, counts);

	return result;
}

export async function mkdir(parent: any, directory: string) {
	const rel = env.fs.relative(parent.terminalPath, directory);

	await env.fs.createDirectory(rel);

	return undefined;
}

export function windows(parent: any, intent: string) {
	switch (intent) {
		case "tile":
			windowsAPI.setWindowTilingMode(true);
			break;
		case "float":
			windowsAPI.setWindowTilingMode(false);
			break;
		default:
			return "Window Organisation Modes:\n   windows tile\n   windows float";
	}

	return "Successfully updated window tiling format";
}

export async function wallpaper(parent: any, intent: string, ...args: any[]) {
	switch (intent) {
		case "set": {
			const dir = env.fs.relative(parent.path, args[0]);

			const content = await env.fs.readFile(dir);

			const val = `url('${content.data}')`;

			windowsAPI.setCSSVariable("wallpaper-url", val);

			return;
		}
		default:
			return "Wallpaper intents:\n  set - Sets the wallpaper\n  get - Gets the wallpaper";
	}
}

export async function size(parent: any, directory: string) {
	const dir = env.fs.relative(parent.path, directory);

	const inf = await pathinf.pathSize(dir);

	return Math.round(inf.value * 100) / 100 + " " + inf.units;
}

export function location(parent: any) {
	return parent.directory;
}
