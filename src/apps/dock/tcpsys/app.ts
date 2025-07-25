import dock from "../resources/dock.js";
import menubar from "../resources/menubar.js";

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
		this.renderer.windowName = "Constellation";

		this.dock = new dock(this);
		this.menubar = new menubar(this);

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
