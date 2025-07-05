export default class Dialogue extends Popup {
	init() {
		this.params = {
			type: this.args[0] || "log",
			title: this.args[1] || "",
			description: this.args[2] || "",
			error: this.args[3] || ""
		};

		this.renderer.window.rename(this.args[1]);

		switch (this.params.type) {
			case "log":
				this.icon = "scroll-text";
				break;
			case "warning":
				this.icon = "message-circle-alert";
			case "error":
				this.icon = "message-circle-warning";
				break;
			default:
				this.icon = "circle-question-mark";
		}

		this.renderer.setWindowIcon(this.icon);
	}

	frame() {
		this.renderer.clear();

		this.renderer.text(60, 12, this.params.description, 20);
		this.renderer.text(0, 60, this.params.error.stack);
		this.renderer.icon(0, 0, this.icon, 2);

		this.renderer.commit();
	}
}
