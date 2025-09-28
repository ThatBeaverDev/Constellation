import CrlRunnerInstance from "../components/core/core.js";

export default class CrlRunner extends Application {
	constructor(directory: string, args: any[]) {
		super(directory, args);
	}

	runtime?: CrlRunnerInstance;
	async init(args: any[]) {
		const targetFile = args[0] || "/System/test";

		const read = await this.env.fs.readFile(targetFile);
		if (!read.ok) throw read.data;
		const code = read.data;

		const isDebug = args[1] == true;

		this.runtime = new CrlRunnerInstance(code, this, undefined, isDebug);
	}

	frame() {
		if (this.runtime == undefined) return;

		this.runtime.frame();
	}
}
