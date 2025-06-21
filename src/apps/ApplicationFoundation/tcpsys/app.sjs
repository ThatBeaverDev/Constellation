export default class ApplicationFoundation extends Application {
	// runs when the app starts
	async init() {
		this.message = "Hello, World!";

		// renames the window
		this.renderer.window.rename("ApplicationFoundation!");

		// change the icon to the app svg
		const directoryIcon = this.os.fs.relative(this.directory, "./resources/icon.svg");
		await this.renderer.window.setIcon(directoryIcon);
	}

	// runs every frame (duh)
	frame() {
		// clears the window
		this.renderer.clear();

		// adds text at 0, 0
		this.renderer.text(0, 0, this.message);

		// dislays the output
		this.renderer.commit();
	}
}
