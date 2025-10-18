import TerminalAlias from "../../../../system/lib/terminalAlias.js";

export default async function mkdir(parent: TerminalAlias, directory: string) {
	const rel = parent.env.fs.resolve(parent.path, directory);

	await parent.env.fs.createDirectory(rel);

	return undefined;
}
