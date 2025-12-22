import TerminalAlias from "../../../../system/lib/terminalAlias";

export default async function ls(parent: TerminalAlias, directory = ".") {
	const dir = parent.env.fs.resolve(parent.path, directory);

	let list: string[];
	try {
		list = await parent.env.fs.listDirectory(dir);
	} catch (e) {
		return e;
	}

	let formatted = "";
	if (list.length > 5) {
		formatted = list.join("\n");
	} else {
		formatted = list.join("    ");
	}

	return formatted;
}
