import TerminalAlias from "/System/lib/terminalAlias";

export default function changeWallpaper(parent: TerminalAlias, path?: string) {
	const cwm = parent.env.getPIDOfName("ConstellationWindowManager");
	if (!cwm) {
		parent.env.warn(
			"Constellation Window Manager is not running. Cannot change wallpaper."
		);
		return;
	}

	parent.env.sendmessage(
		cwm,
		"changeWallpaper",
		path ? parent.env.fs.resolve(parent.path, path) : undefined
	);
}
