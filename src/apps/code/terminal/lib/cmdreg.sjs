export async function cd(parent, directory = "~") {
	const target = env.fs.relative(parent.terminalPath, directory);

	try {
		await ls(parent, target);

		parent.terminalPath = target;
	} catch (e) {
		return directory + " is not a valid directory!";
	}
}

export function pwd(parent) {
	return parent.terminalPath;
}

export function clear(parent) {
	parent.logs = [];
}

// fs operations
export async function ls(parent, directory = ".") {
	const dir = env.fs.relative(parent.terminalPath, directory);

	const list = await env.fs.listDirectory(dir);

	if (!list.ok) {
		console.log(list);
		return list.data;
	}

	const formatted = list.data.join("   ");

	return formatted;
}

export async function cat(parent, directory) {
	const rel = env.fs.relative(parent.terminalPath, directory);

	const resp = await env.fs.readFile(rel);

	if (!resp.ok) {
		return "File does not exist (or a general filesystem error occurred)";
	}

	const contents = resp.data;

	return contents;
}

export async function touch(parent, directory) {
	const rel = env.fs.relative(parent.terminalPath, directory);

	const resp = await env.fs.createFile(rel);

	if (!resp.ok) {
		return "Error creating file: " + resp.data;
	}
}

async function treeWalk(directory, prefix, maxDepth, depth, counts) {
	//if (depth > maxDepth) {
	//	return;
	//}

	let result = "";

	let resp = await env.fs.listDirectory(directory);
	if (!resp.ok) {
		return;
	}
	const contents = resp.data;

	contents.sort();

	for (const i in contents) {
		let file = contents[i];

		if (/*(*/ file[0] !== "." /*) || (obj.showHidden)*/) {
			const parts =
				i == contents.length - 1 ? ["└── ", "    "] : ["├── ", "│   "];

			let dispFile = String(file);

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

export async function tree(parent, directory = ".") {
	const dir = env.fs.relative(parent.terminalPath, directory);

	let result = dir + "\n";

	const counts = {
		files: 0,
		dirs: 0
	};

	result += await treeWalk(dir, "", Infinity, 0, counts);

	return result;
}
export async function mkdir(parent, directory) {
	const rel = env.fs.relative(parent.terminalPath, directory);

	await env.fs.createDirectory(rel);

	return undefined;
}
