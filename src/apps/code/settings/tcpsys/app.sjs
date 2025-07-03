export default class systemSettings extends Application {
	async init() {
		// import sidebar
		const sidebar = await env.include(
			env.fs.relative(this.directory, "resources/panels/sidebar.sjs")
		);
		this.sidebar = new sidebar.default(this);

		// import body
		const body = await env.include(
			env.fs.relative(this.directory, "resources/panels/body.sjs")
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
