import TerminalAlias from "../../../../lib/terminalAlias";

export default function rm(parent: TerminalAlias, ...locations: string[]) {
	const env = parent.env;

	const targets: string[] = [];
	for (const i in locations) {
		if (locations[i][0] == "-") {
			switch (locations[i]) {
				case "-r":
					env.fs.deleteDirectory;
					break;
			}
		} else {
			targets.push(locations[i]);
		}
	}

	parent.env.log(env);
}
