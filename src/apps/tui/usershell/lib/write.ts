import TerminalAlias from "../../../../system/lib/terminalAlias";

export default async function write(
	parent: TerminalAlias,
	content: string,
	file: string
) {
	const path = parent.env.fs.resolve(parent.path, file);

	await parent.env.fs.writeFile(content, path);
}
