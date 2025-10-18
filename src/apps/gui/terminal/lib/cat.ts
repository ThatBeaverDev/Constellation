import TerminalAlias from "../../../../system/lib/terminalAlias.js";

export default async function cat(parent: TerminalAlias, directory: string) {
	const rel = parent.env.fs.resolve(parent.path, directory);

	let contents: string;
	try {
		contents = await parent.env.fs.readFile(rel);
	} catch {
		return "File does not exist (or a general filesystem error occurred)";
	}

	return contents;
}
