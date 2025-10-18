import TerminalAlias from "../../../../system/lib/terminalAlias.js";

export default async function ls(parent: TerminalAlias, directory = ".") {
	const dir = parent.env.fs.resolve(parent.path, directory);

	let list: string[];
	try {
		list = await parent.env.fs.listDirectory(dir);
	} catch (e) {
		return e;
	}

	const formatted = list.join("   ");

	return formatted;
}
