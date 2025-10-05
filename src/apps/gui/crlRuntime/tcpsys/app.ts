import CrlInstance from "../components/crl.js";

export default class CrlRunner extends Application {
	#runtime?: CrlInstance;
	async init(args: any[]) {
		const targetFile =
			args[0] ||
			this.env.fs.resolve(this.directory, "./resources/default.crl");

		const read = await this.env.fs.readFile(targetFile);
		if (!read.ok) throw read.data;
		const code = read.data;

		const isDebug = args[1] == true;

		this.#runtime = new CrlInstance(code, this, undefined, isDebug);
	}

	frame() {
		if (this.#runtime == undefined) return;

		this.#runtime.frame();
	}
}
