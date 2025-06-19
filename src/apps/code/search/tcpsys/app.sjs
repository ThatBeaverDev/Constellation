export default class search extends Process {
	init() {}

	frame() {
		this.renderer.window.resize(window.innerWidth / 2, 100);
		this.renderer.window.rename("Keystone Search");

		this.renderer.clear();
		this.renderer.textbox(0, 0, "Search Constellation", {
			update: (key, content) => {
				console.log(content);
			},
			enter: (content) => {
				console.log(content);
			}
		});
		this.renderer.commit();
	}
}
