import TerminalAlias from "../../../lib/terminalAlias";

const pathinf = await env.include("/System/CoreLibraries/pathinf.js");

export default async function size(parent: TerminalAlias, directory: string) {
	const dir = parent.env.fs.resolve(parent.path, directory);

	const inf = await pathinf.pathSize(dir);

	return Math.round(inf.value * 100) / 100 + " " + inf.units;
}
