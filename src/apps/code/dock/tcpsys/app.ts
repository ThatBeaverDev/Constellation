export default class dockAndDesktop extends Application {
	async init() {
		this.renderer.window.hide();
		this.renderer.window.move(0, 0);
		this.renderer.window.resize(window.innerWidth, window.innerHeight - 25);
	}

	frame() {
		this.renderer.clear();

		this.renderer.box(
			0,
			0,
			window.innerWidth,
			window.innerHeight,
			"rgb(255, 255, 255)"
		);

		this.renderer.commit();
	}
}
