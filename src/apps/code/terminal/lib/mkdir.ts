import TerminalAlias from "../../../../lib/terminalAlias";

export default async function mkdir(parent: TerminalAlias, directory: string) {
	const rel = parent.env.fs.relative(parent.path, directory);

	await parent.env.fs.createDirectory(rel);

	return undefined;
}
