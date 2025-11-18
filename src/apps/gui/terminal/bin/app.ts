export default class TerminalUI extends GuiApplication {
	async init() {
		this.renderer.windowName = "Terminal";
		this.renderer.setIcon("square-terminal");
	}

	frame() {
		this.renderer.clear();

		this.renderer.embeddedTui(
			0,
			0,
			this.renderer.windowWidth,
			this.renderer.windowHeight
		);

		this.renderer.commit();
	}
}
