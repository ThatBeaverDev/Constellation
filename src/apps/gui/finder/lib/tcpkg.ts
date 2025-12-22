import TerminalAlias from "../../../../system/lib/terminalAlias.js";
import { userspacePackage } from "/System/lib/packaging/tcpkg.js";

export default async function tcpkg(
	parent: TerminalAlias,
	input: string,
	output: string
) {
	parent.env.fs.writeFile(
		parent.env.fs.resolve(parent.path, output),
		JSON.stringify(
			await userspacePackage(
				parent.env.fs,
				parent.env.fs.resolve(parent.path, input)
			)
		)
	);
}
