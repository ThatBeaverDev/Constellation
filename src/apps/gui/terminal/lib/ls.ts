import TerminalAlias from "../../../../system/lib/terminalAlias.js";

export default async function ls(parent: TerminalAlias, directory = ".") {
	const dir = parent.env.fs.resolve(parent.path, directory);

	const list = await parent.env.fs.listDirectory(dir);

	if (!list.ok) {
		return list.data;
	}

	const formatted = list.data.join("   ");

	return formatted;
}
