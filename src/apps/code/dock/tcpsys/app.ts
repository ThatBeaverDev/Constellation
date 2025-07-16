export default class dockAndDesktop extends Application {
	dock: any;
	menubar: any;

	async init() {
		this.renderer.window.hide();
		this.renderer.window.hideHeader();
		this.renderer.window.square();

		//this.renderer.setWindowIcon("dock")
		this.renderer.setWindowIcon(
			"/System/CoreAssets/Logos/Constellation-White.svg"
		);

		this.dock = new (
			await this.env.include(
				this.env.fs.relative(this.directory, "resources/dock.js")
			)
		).default(this);
		this.menubar = new (
			await this.env.include(
				this.env.fs.relative(this.directory, "resources/menubar.js")
			)
		).default(this);
	}

	frame() {
		// resize and reposition
		this.renderer.window.move(0, 0);
		this.renderer.window.resize(window.innerWidth, window.innerHeight);

		this.renderer.clear();

		this.dock.render();
		this.menubar.render();

		this.renderer.commit();
	}
}
