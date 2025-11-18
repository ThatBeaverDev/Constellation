import TerminalAlias from "../../../../system/lib/terminalAlias";

interface RemovalUtilityOptions {
	recursive: boolean;
	target: string;
}

export default async function rm(parent: TerminalAlias, ...args: string[]) {
	const env = parent.env;

	const cfg: RemovalUtilityOptions = {
		recursive: false,
		target: ""
	};

	args.forEach((arg) => {
		if (arg[0] == "-") {
			switch (arg) {
				case "-r":
					cfg.recursive = true;
					break;
			}
		} else {
			cfg.target = arg;
		}
	});

	if (cfg.target == "") return "Target for deletion must be specified";

	if (cfg.recursive) {
		await env.fs.deleteDirectory(cfg.target);
	} else {
		await env.fs.deleteFile(cfg.target);
	}
}
