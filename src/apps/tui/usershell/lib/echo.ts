import TerminalAlias from "../../../../system/lib/terminalAlias";

export default function echo(parent: TerminalAlias, ...args: any[]) {
	return args.map((item) => String(item)).join(" ");
}
