import dock from "../resources/dock";
import menubar from "../resources/menubar";

export default class dockAndDesktop extends Application {
	dock?: dock;
	menubar?: menubar;
	showApps: boolean = false;

	async init() {
		this.renderer.window.hide();
		this.renderer.window.hideHeader();
		this.renderer.window.square();

		//this.renderer.setWindowIcon("dock")
		this.renderer.setWindowIcon(
			"/System/CoreAssets/Logos/Constellation-White.svg"
		);
		this.renderer.window.rename("Constellation");

		this.dock = new (
			await this.env.include(
				this.env.fs.resolve(this.directory, "resources/dock.js")
			)
		).default(this);
		this.menubar = new (
			await this.env.include(
				this.env.fs.resolve(this.directory, "resources/menubar.js")
			)
		).default(this);

		this.renderer.window.minimise = () => {
			this.showApps = true;
		};
	}

	frame() {
		// resize and reposition
		this.renderer.window.move(0, 0);
		this.renderer.window.resize(window.innerWidth, window.innerHeight);

		this.renderer.clear();

		if (this.dock !== undefined) this.dock.render();
		if (this.menubar !== undefined) this.menubar.render();

		this.renderer.commit();
	}
}
