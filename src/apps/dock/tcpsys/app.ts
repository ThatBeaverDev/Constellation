import dock from "../resources/dock";
import menubar from "../resources/menubar";

export default class dockAndDesktop extends Application {
	dock?: dock;
	menubar?: menubar;
	showApps: boolean = false;

	async init() {
		this.renderer.makeWindowInvisible();
		this.renderer.hideWindowHeader();
		this.renderer.hideWindowCorners();

		//this.renderer.setIcon("dock")
		this.renderer.setIcon(
			"/System/CoreAssets/Logos/Constellation-White.svg"
		);
		this.renderer.renameWindow("Constellation");

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

		this.renderer.minimiseWindow = () => {
			this.showApps = true;
		};
	}

	frame() {
		// resize and reposition
		this.renderer.moveWindow(0, 0);
		this.renderer.resizeWindow(window.innerWidth, window.innerHeight);

		this.renderer.clear();

		if (this.dock !== undefined) this.dock.render();
		if (this.menubar !== undefined) this.menubar.render();

		this.renderer.commit();
	}
}
