import TerminalAlias from "../../../../lib/terminalAlias.js";

export default async function cd(parent: TerminalAlias, directory = "~") {
	const target = parent.env.fs.resolve(parent.path, directory);

	try {
		const ls = await parent.env.fs.listDirectory(directory);
		if (!ls.ok) return;
		if (ls.data == undefined) return;

		parent.path = target;
	} catch {
		return directory + " is not a valid directory!";
	}
}
