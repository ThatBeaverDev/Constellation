const name = "roturIntegration.appl";

export default class roturGui extends Application {
	tick: number = 0;
	state: "auth" | "dash" = "dash";
	pages: any;
	name: string = "roturIntegration.appl";

	pipes: {
		send?: any[];
		recieve?: any[];
	} = {};
	ok: boolean = false;

	async init() {
		if (this.args[0] == "iNeedYouToLoginPlease") {
			this.state = "auth";
			this.pipes = {
				recieve: this.args[1],
				send: this.args[2]
			};
		}

		this.renderer.window.rename("Rotur");
		this.renderer.setWindowIcon(
			env.fs.relative(this.directory, "./resources/icon.svg")
		);

		const dashImport = await env.include(
			env.fs.relative(this.directory, "resources/pages/dash.js")
		);
		const authImport = await env.include(
			env.fs.relative(this.directory, "resources/pages/auth.js")
		);

		this.pages = {
			dash: new dashImport.default(this),
			auth: new authImport.default(this)
		};

		this.ok = true;
	}

	async getStatus() {
		const directoryListing = await env.fs.listDirectory(
			"/Temporary/roturIntegration"
		);
		if (directoryListing.data == undefined) {
			// the uh thingy isnt running
			await env.exec("/Applications/Rotur.backgr");
			env.debug(name, "Starting rotur.backgr connector service.");
		}

		const read = await env.fs.readFile(
			"/Temporary/roturIntegration/status.json"
		);

		if (!read.ok) {
			throw read.data;
		}
		let json;
		try {
			json = JSON.parse(read.data);
		} catch {
			return undefined;
		}

		return json;
	}

	frame() {
		if (!this.ok) return;

		this.tick++;

		this.renderer.clear();

		this.pages[this.state].render();

		this.renderer.commit();
	}
}
