import TerminalAlias from "../../../lib/terminalAlias";

const pathinf = await env.include("/System/CoreLibraries/pathinf.js");

export type fileInfo = {
	directory: string;
	name: string;
	icon: string;
	visible: boolean;
};

export type appFindResult = { files: fileInfo[]; names: string[] };

export default async function find(
	parent: TerminalAlias,
	directories: string[] = [
		"/System/CoreExecutables",
		"/Applications" /*,"~/Applications"*/
	]
): Promise<appFindResult> {
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
		const localFiles: fileInfo[] = [];
		for (const dir of localNames) {
			const obj: fileInfo = {
				directory: dir,
				name: await pathinf.pathName(dir),
				icon: await pathinf.pathIcon(dir),
				visible: await pathinf.pathVisible(dir)
			};

			if (
				obj.directory.endsWith(".backgr") ||
				obj.directory.endsWith(".appl")
			) {
				if (obj.name.startsWith("/")) {
					obj.name = obj.directory.textAfterAll("/");
				}
			}

			localFiles.push(obj);
		}

		files = [...localFiles, ...files];
	}

	return {
		files,
		names
	};
}
