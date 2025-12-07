import { pathIcon } from "/System/CoreLibraries/pathinf";

export default class TextViewer extends GuiApplication {
	counter = 0;
	file: string = "";
	fileicon: string = "/System/CoreAssets/Vectors/files/file.svg";
	text: string = "";
	displayedState: {
		windowWidth: number;
		windowHeight: number;
		text: string;
	} = { windowWidth: 0, windowHeight: 0, text: "" };

	headerHeight = 50;
	padding = 15;

	async refresh() {
		//if (this.file == "") {
		//	this.file = await this.renderer.openFile();
		//}

		const filetype = this.file.textAfterAll(".");
		const text = (await this.env.fs.readFile(this.file)) ?? "";

		switch (filetype) {
			case "json":
				try {
					this.text = JSON.stringify(JSON.parse(text), null, 4);
				} catch (e) {
					this.text = text;
				}
				break;
			default:
				this.text = text;
		}

		this.fileicon = await pathIcon(this.env, this.file);
		this.renderer.setIcon(this.fileicon);
		this.renderer.windowName = `Text Viewer - ${this.file}`;

		this.addTextNewlines();
	}

	addTextNewlines() {
		const { windowWidth, windowHeight } = this.renderer;

		const text = this.renderer.insertNewlines(this.text, windowWidth - 200);

		this.displayedState = {
			windowWidth,
			windowHeight,
			text
		};
	}

	async init(args: string[]) {
		if (args[0]) {
			this.file = args[0];
		}

		await this.refresh();
	}

	frame() {
		if (this.counter++ % 5000) {
			this.refresh();
		}

		if (
			this.displayedState.windowWidth !== this.renderer.windowWidth ||
			this.displayedState.windowHeight !== this.renderer.windowHeight
		) {
			this.addTextNewlines();
		}

		this.renderer.clear();

		this.renderer.box(0, 0, this.renderer.windowWidth, this.headerHeight);

		this.renderer.text(
			100,
			this.headerHeight + this.padding,
			this.displayedState.text
		);

		this.renderer.commit();
	}
}
