import TerminalAlias from "../../../../system/lib/terminalAlias.js";
import { userspaceUnpackage } from "/System/lib/packaging/tcupkg.js";

export default async function tcupkg(
	parent: TerminalAlias,
	target: string,
	output: string
) {
	const idx = JSON.parse(
		await parent.env.fs.readFile(parent.env.fs.resolve(parent.path, target))
	);

	return userspaceUnpackage(
		parent.env.fs,
		idx,
		parent.env.fs.resolve(parent.path, output)
	);
}
