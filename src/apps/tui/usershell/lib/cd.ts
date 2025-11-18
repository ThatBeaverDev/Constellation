import TerminalAlias from "../../../../system/lib/terminalAlias";

export default async function cd(parent: TerminalAlias, directory = "~") {
	const target = parent.env.fs.resolve(parent.path, directory);

	try {
		const ls = await parent.env.fs.listDirectory(directory);
		if (ls == undefined) return `no such directory: ${directory}`;

		parent.path = target;
	} catch {
		return `no such directory: ${directory}`;
	}
}
