import TerminalAlias from "../../../../lib/terminalAlias";

export default async function cat(parent: TerminalAlias, directory: string) {
	const rel = parent.env.fs.relative(parent.path, directory);

	const resp = await parent.env.fs.readFile(rel);

	if (!resp.ok) {
		return "File does not exist (or a general filesystem error occurred)";
	}

	const contents = resp.data;

	return contents;
}
