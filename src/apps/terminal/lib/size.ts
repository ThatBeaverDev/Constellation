import TerminalAlias from "../../../lib/terminalAlias";
import { pathSize } from "pathinf";

export default async function size(parent: TerminalAlias, directory: string) {
	const dir = parent.env.fs.resolve(parent.path, directory);

	const inf = await pathSize(parent.env, dir);

	return Math.round(inf.value * 100) / 100 + " " + inf.units;
}
