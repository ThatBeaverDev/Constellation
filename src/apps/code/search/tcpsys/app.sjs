export default class search extends Process {
	init() {}

	frame() {
		this.renderer.clear();
		this.renderer.text(0, 0, "Hello, World!");
		this.renderer.commit();
	}
}
