import TerminalAlias from "../../../../system/lib/terminalAlias";
import { tokenise } from "../components/tokenise.js";

export default class UserShell extends CommandLineApplication {
	get path() {
		return this.ref?.path || "/";
	}
	set path(value: string) {
		if (!this.ref) return;

		this.ref.path = value;
	}
	ref?: TerminalAlias;

	async init(args: string[]) {
		if (args?.[0]) {
			this.path = args[0];
		}

		this.ref = {
			clearLogs: () => {
				this.clearView();
			},
			env: this.env,
			path: this.path,
			origin: String(this.directory)
		};
		this.clearView();

		this.env.shell.setRef(this.ref);
	}

	tokenise(cmd: string) {
		return tokenise(cmd, true);

		//return cmd.split(" ").filter((item) => item !== "");
	}

	async frame() {
		const cmd = await this.getInput(`${this.env.user} ${this.path} > `);
		if (cmd.trim() == "") {
			return;
		}

		let bits: string[] = [];
		try {
			bits = this.tokenise(cmd).map((item) => {
				const quotes = ['"', "'", "`"];

				if (quotes.includes(item[0])) {
					if (item.at(-1) == item[0]) {
						return item.substring(1, item.length - 1);
					}
				}

				return item;
			});
		} catch (e) {
			this.println(Stringify(e));
			return;
		}

		function Stringify(data: any) {
			const StringResult = String(data);
			const objectObjectName = `[object ${Object.getPrototypeOf(data).constructor.name}]`;

			if (StringResult == objectObjectName) {
				return JSON.stringify(data, null, 4);
			} else {
				return StringResult;
			}
		}

		try {
			await this.env.shell.index();
			this.env.shell.setRef(this.ref);

			const execution = await this.env.shell.exec(
				bits[0],
				...bits.slice(1)
			);

			if (!execution) return;

			this.ref = execution.ref;
			let result = execution.result;

			if (result == undefined) return;

			this.println(Stringify(result));
		} catch (e) {
			this.println(String(e));
			console.error(e);
		}
	}
}
