import TerminalAlias from "../../../../system/lib/terminalAlias";

export default async function move(
	parent: TerminalAlias,
	input: string,
	output: string
) {
	parent.env.fs.move(input, output);
}
