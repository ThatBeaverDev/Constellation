import TerminalAlias from "../../../../system/lib/terminalAlias";

export default async function copyFiles(
	parent: TerminalAlias,
	input: string,
	output: string
) {
	await parent.env.fs.copy(input, output);
}
