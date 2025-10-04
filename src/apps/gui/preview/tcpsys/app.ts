export default class FilePreview extends Application {
	targetFile: string = "./resources/default.jpg";

	async init(args: (string | undefined)[]) {
		const targetFile = args[0];
		if (targetFile == undefined) throw new Error("A file must be opened!");

		this.targetFile = targetFile;

		this.renderer.windowName = `Preview: ${targetFile.textAfterAll("/")}`;
		this.renderer.setIcon("image");
	}

	frame() {
		this.renderer.clear();

		const windowWidth = this.renderer.windowWidth;
		const windowHeight = this.renderer.windowHeight;

		const padding = 15;
		const doublePadding = padding * 2;

		const iconDefaultSize = 24;
		const iconHorizontalScaling =
			(windowWidth - doublePadding) / iconDefaultSize;
		const iconVerticlaScaling =
			(windowHeight - doublePadding) / iconDefaultSize;

		const iconScale = Math.min(iconHorizontalScaling, iconVerticlaScaling);
		const iconSize = iconDefaultSize * iconScale;

		const left = (this.renderer.windowWidth - iconSize) / 2;
		const top = (this.renderer.windowHeight - iconSize) / 2;

		this.renderer.icon(left, top, this.targetFile, iconScale);

		this.renderer.commit();
	}
}
