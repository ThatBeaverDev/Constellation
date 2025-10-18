import TerminalAlias from "../../../../system/lib/terminalAlias.js";

export default async function touch(parent: TerminalAlias, directory: string) {
	const rel = parent.env.fs.resolve(parent.path, directory);

	try {
		await parent.env.fs.writeFile(rel, "");
	} catch (e) {
		return "Error creating file: " + String(e);
	}
}
