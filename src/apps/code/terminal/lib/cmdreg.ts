import terminalUI from "../tcpsys/app";

export default class terminalCommandRegistry {
	parent: terminalUI;
	env: terminalUI["env"];

	gitLibrary: any;
	windowsAPI: any;
	pathinf: any;

	constructor(parent: terminalUI) {
		this.parent = parent;
		this.env = parent.env;

		// libraries
		this.gitLibrary = this.env.include("/System/CoreLibraries/git.js");
		this.windowsAPI = this.env.include("/System/windows.js");
		this.pathinf = this.env.include("/System/CoreLibraries/pathinf.js");
	}

	async init() {
		this.gitLibrary = await this.gitLibrary;
		this.windowsAPI = await this.windowsAPI;
		this.pathinf = await this.pathinf;
	}

	async cd(parent: any, directory = "~") {
		const target = this.env.fs.relative(parent.terminalPath, directory);

		try {
			await this.ls(parent, target);

			parent.terminalPath = target;
		} catch {
			return directory + " is not a valid directory!";
		}
	}

	pwd(parent: any) {
		return parent.terminalPath;
	}

	clear(parent: any) {
		parent.logs = [];
	}

	// fs operations
	async ls(parent: any, directory = ".") {
		const dir = this.env.fs.relative(parent.terminalPath, directory);

		const list = await this.env.fs.listDirectory(dir);

		if (!list.ok) {
			return list.data;
		}

		const formatted = list.data.join("   ");

		return formatted;
	}

	async cat(parent: any, directory: string) {
		const rel = this.env.fs.relative(parent.terminalPath, directory);

		const resp = await this.env.fs.readFile(rel);

		if (!resp.ok) {
			return "File does not exist (or a general filesystem error occurred)";
		}

		const contents = resp.data;

		return contents;
	}

	async touch(parent: any, directory: string) {
		const rel = this.env.fs.relative(parent.terminalPath, directory);

		const resp = await this.env.fs.writeFile(rel, "");

		if (!resp.ok) {
			return "Error creating file: " + resp.data;
		}
	}

	private async treeWalk(
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

		const resp = await this.env.fs.listDirectory(directory);
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

				const asDir = await this.env.fs.relative(directory, file);

				//if (obj.fullDir) {
				//	dispFile = asDir;
				//};

				const resp = await this.env.fs.stat(asDir);
				if (!resp.ok) {
					continue;
				}
				const isDir = resp.data.isDirectory();

				if (isDir) {
					result += prefix + parts[0] + dispFile + `\n`;
					counts.dirs++;
					result += await this.treeWalk(
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

	async tree(parent: any, directory = ".") {
		const dir = this.env.fs.relative(parent.terminalPath, directory);

		let result = dir + "\n";

		const counts = {
			files: 0,
			dirs: 0
		};

		result += await this.treeWalk(dir, "", Infinity, 0, counts);

		result += `${counts.dirs} directories, ${counts.files} files`;

		return result;
	}

	async git(parent: any, subcommand: string, ...args: any[]) {
		if (subcommand == undefined) {
			return (
				"Valid Commands: \n" + Object.keys(this.gitLibrary).join("\n")
			);
		}

		return await this.gitLibrary[subcommand](parent.terminalPath, ...args);
	}

	async mkdir(parent: any, directory: string) {
		const rel = this.env.fs.relative(parent.terminalPath, directory);

		await this.env.fs.createDirectory(rel);

		return undefined;
	}

	windows(parent: any, intent: string) {
		switch (intent) {
			case "tile":
				this.windowsAPI.setWindowTilingMode(true);
				break;
			case "float":
				this.windowsAPI.setWindowTilingMode(false);
				break;
			default:
				return "Window Organisation Modes:\n   windows tile\n   windows float";
		}

		return "Successfully updated window tiling format";
	}

	async wallpaper(parent: any, intent: string, ...args: any[]) {
		switch (intent) {
			case "set": {
				const dir = this.env.fs.relative(parent.path, args[0]);

				const content = await this.env.fs.readFile(dir);

				const val = `url('${content.data}')`;

				this.windowsAPI.setCSSVariable("wallpaper-url", val);

				return;
			}
			default:
				return "Wallpaper intents:\n  set - Sets the wallpaper\n  get - Gets the wallpaper";
		}
	}

	async size(parent: any, directory: string) {
		const dir = this.env.fs.relative(parent.path, directory);

		const inf = await this.pathinf.pathSize(dir);

		return Math.round(inf.value * 100) / 100 + " " + inf.units;
	}

	location(parent: any) {
		return parent.directory;
	}
}
