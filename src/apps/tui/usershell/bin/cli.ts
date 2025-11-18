import TerminalAlias from "../../../../system/lib/terminalAlias";

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

	async frame() {
		const cmd = await this.getInput(`${this.env.user} ${this.path} > `);

		const bits = cmd.split(" ").filter((item) => item !== "");

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
