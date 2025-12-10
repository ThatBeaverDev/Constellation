import TerminalAlias from "../../../../system/lib/terminalAlias.js";
import { pathName, pathIcon, pathVisible, getAppConfig } from "pathinf";

export type fileInfo = {
	directory: string;
	name: string;
	icon: string;
	visible: boolean;
	filetypes: string[];
};

export type appFindResult = { files: fileInfo[]; names: string[] };

export default async function findApplications(
	parent: TerminalAlias,
	directories: string[] = [
		"/System/CoreExecutables",
		"/Applications" /*,"~/Applications"*/
	]
): Promise<appFindResult> {
	let files: fileInfo[] = [];
	let names: string[] = [];

	for (const searchDirectory of directories) {
		const list = await parent.env.fs.listDirectory(searchDirectory);

		const localNames = list.map((item: string) =>
			parent.env.fs.resolve(searchDirectory, String(item))
		);
		names = [...localNames, ...names];

		// build file objects
		const localFiles: fileInfo[] = [];
		for (const applicationDirectory of localNames) {
			if (
				!(
					applicationDirectory.endsWith(".appl") ||
					applicationDirectory.endsWith(".srvc")
				)
			) {
				continue;
			}

			const config = await getAppConfig(parent.env, applicationDirectory);

			const obj: fileInfo = {
				directory: applicationDirectory,
				name: await pathName(parent.env, applicationDirectory),
				icon: await pathIcon(parent.env, applicationDirectory),
				visible: await pathVisible(parent.env, applicationDirectory),
				filetypes: config?.filetypes || []
			};

			if (
				obj.directory.endsWith(".srvc") ||
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
