import TerminalAlias from "../../../../system/lib/terminalAlias.js";
import { userspacePackage } from "/System/lib/packaging/tcpkg.js";

export default async function tcupkg(
	parent: TerminalAlias,
	input: string,
	output: string
) {
	parent.env.fs.writeFile(
		output,
		JSON.stringify(await userspacePackage(parent.env.fs, input))
	);
}
