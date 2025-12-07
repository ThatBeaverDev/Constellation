// TODO: Finish me!

import TerminalAlias from "../../../../../system/lib/terminalAlias";
import { openFile } from "gui";

export default function open(parent: TerminalAlias, file: string) {
	openFile(parent.env, parent.env.fs.resolve(parent.path, file));
}
