import TerminalAlias from "../../../../system/lib/terminalAlias.js";

export default function allocateFileTypeToApplication(
	parent: TerminalAlias,
	filetype: string,
	application: string
) {
	const manager = parent.env.getPIDOfName("ftypedbmgr");
	if (!manager) return;

	parent.env.sendmessage(manager, "setDefault", [filetype, application]);
}
