export default class ApplicationFoundation extends Application {
	// runs when the app starts
	async init() {
		this.message = "Hello, World!";

		// renames the window
		this.renderer.window.rename("ApplicationFoundation!");

		// change the icon to the app svg
		//const directoryIcon = this.env.fs.resolve(this.directory, "./resources/icon.svg");
		//await this.renderer.window.setIcon(directoryIcon);
		// currently the only way to set an app icon is from the icon set
		await this.renderer.setWindowIcon("party-popper");
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
