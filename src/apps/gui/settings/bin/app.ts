import body from "../resources/panels/body.js";
import sidebar from "../resources/panels/sidebar.js";

	sidebar?: sidebar;
	body?: body;
export default class systemSettings extends GuiApplication {


	async init() {
		// import sidebar
		const sidebar = await this.env.include(
			this.env.fs.resolve(this.directory, "resources/panels/sidebar.js")
		);
		this.sidebar = new sidebar.default(this);

		// import body
		const body = await this.env.include(
			this.env.fs.resolve(this.directory, "resources/panels/body.js")
		);
		this.body = new body.default(this);

		this.renderer.windowName = "System Settings";
		this.renderer.setIcon("cog");
	}

	frame() {
		this.renderer.clear();

		if (this.sidebar !== undefined) this.sidebar.render();
		if (this.body !== undefined) this.body.render();

		this.renderer.commit();
	}
}
