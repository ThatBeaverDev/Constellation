import TerminalAlias from "../../../../system/lib/terminalAlias";

export default async function exec(parent: TerminalAlias, path: string) {
	const directory = parent.env.fs.resolve(parent.path, path);

	try {
		await parent.env.exec(directory);

		return;
	} catch (e) {
		return `Failed to execute ${directory} (${e})`;
	}
}
