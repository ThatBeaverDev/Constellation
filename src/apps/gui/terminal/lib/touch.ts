import TerminalAlias from "../../../../lib/terminalAlias";

export default async function touch(parent: TerminalAlias, directory: string) {
	const rel = parent.env.fs.resolve(parent.path, directory);

	const resp = await parent.env.fs.writeFile(rel, "");

	if (!resp.ok) {
		return "Error creating file: " + resp.data;
	}
}
