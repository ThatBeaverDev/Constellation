import LanguageInstance from "../components/core/core.js";

export default class CoreLanguageRuntime extends Application {
	constructor(directory: string, args: any[]) {
		super(directory, args);
	}

	runtime?: LanguageInstance;
	async init(args: any[]) {
		const targetFile = args[0] || "/System/test";

		const read = await this.env.fs.readFile(targetFile);
		if (!read.ok) throw read.data;
		const code = read.data;

		this.runtime = new LanguageInstance(code);
	}

	frame() {
		if (this.runtime == undefined) return;

		this.runtime.frame();
	}
}
