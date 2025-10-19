import { Stats } from "../../../../fs/BrowserFsTypes.js";
import TerminalAlias from "../../../../system/lib/terminalAlias.js";

export default async function tree(parent: TerminalAlias, directory = ".") {
	const dir = parent.env.fs.resolve(parent.path, directory);

	let result = dir + "\n";

	const counts = {
		files: 0,
		dirs: 0
	};

	result += await treeWalk(parent, dir, "", Infinity, 0, counts);

	result += `${counts.dirs} directories, ${counts.files} files`;

	return result;
}

async function treeWalk(
	parent: TerminalAlias,
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

	const contents = await parent.env.fs.listDirectory(directory);

	contents.sort();

	for (const i in contents) {
		const file = contents[i];

		if (/*(*/ file[0] !== "." /*) || (obj.showHidden)*/) {
			const parts =
				Number(i) == contents.length - 1
					? ["└── ", "    "]
					: ["├── ", "│   "];

			const dispFile = String(file);

			const asDir = await parent.env.fs.resolve(directory, file);

			//if (obj.fullDir) {
			//	dispFile = asDir;
			//};

			let stats: Stats;
			try {
				stats = await parent.env.fs.stat(asDir);
			} catch {
				continue;
			}

			const isDir = stats.isDirectory();

			if (isDir) {
				result += prefix + parts[0] + dispFile + `\n`;
				counts.dirs++;
				result += await treeWalk(
					parent,
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
