import CrlInstance from "../components/crl.js";

export default class CrlRunner extends Application {
	#runtime?: CrlInstance;
	async init(args: any[]) {
		const targetFile =
			args[0] ||
			this.env.fs.resolve(this.directory, "./resources/default.crl");

		const code = await this.env.fs.readFile(targetFile);

		const isDebug = args[1] == true;

		this.#runtime = new CrlInstance(code, this, undefined, isDebug);
	}

	frame() {
		if (this.#runtime == undefined) return;

		this.#runtime.frame();
	}
}
