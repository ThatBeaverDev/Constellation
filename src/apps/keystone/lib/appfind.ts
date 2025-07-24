import TerminalAlias from "../../../lib/terminalAlias";

const pathinf = await env.include("/System/CoreLibraries/pathinf.js");

type fileInfo = {
	directory: string;
	name: string;
	icon: string;
};

export default async function find(
	parent: TerminalAlias,
	directories: string[] = [
		"/System/CoreExecutables",
		"/Applications" /*,"~/Applications"*/
	]
): Promise<{ files: fileInfo[]; names: string[] }> {
	let files: fileInfo[] = [];
	let names: string[] = [];

	for (const directory of directories) {
		const list = await parent.env.fs.listDirectory(directory);
		if (!list.ok) throw list.data;

		const localNames = list.data.map((item: string) =>
			parent.env.fs.resolve(directory, String(item))
		);
		names = [...localNames, ...names];

		// build file objects
		const localFiles = localNames.map((dir: string) => {
			return {
				directory: dir,
				name: pathinf.pathName(dir),
				icon: pathinf.pathIcon(dir)
			};
		});

		for (const vl of localFiles) {
			vl.icon = await vl.icon;
			vl.name = await vl.name;

			if (
				vl.directory.endsWith(".backgr") ||
				vl.directory.endsWith(".appl")
			) {
				if (vl.name.startsWith("/")) {
					vl.name = vl.directory.textAfterA;
					("/");
				}
			}
		}

		files = [...localFiles, ...files];
	}

	return {
		files,
		names
	};
}
