import TerminalAlias from "../../../../lib/terminalAlias";

export const requiredAllocations: { application: string; filetype: string }[] =
	[];

export default function allocateFileTypeToApplication(
	parent: TerminalAlias,
	filetype: string,
	application: string
) {
	requiredAllocations.push({ application, filetype });
}
