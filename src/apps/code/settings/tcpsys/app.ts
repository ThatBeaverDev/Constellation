export default class systemSettings extends Application {
	sidebar: any;
	body: any;

	async init() {
		// import sidebar
		const sidebar = await this.env.include(
			this.env.fs.relative(this.directory, "resources/panels/sidebar.js")
		);
		this.sidebar = new sidebar.default(this);

		// import body
		const body = await this.env.include(
			this.env.fs.relative(this.directory, "resources/panels/body.js")
		);
		this.body = new body.default(this);

		this.renderer.window.rename("System Settings");
		this.renderer.setWindowIcon("cog");
	}

	frame() {
		this.renderer.clear();

		this.sidebar.render();
		this.body.render();

		this.renderer.commit();
	}
}
