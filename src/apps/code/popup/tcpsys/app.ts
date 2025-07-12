export default class Dialogue extends Popup {
	params!: {
		type: string;
		title: string;
		description: string;
		error: string;
	};
	icon: string = "circle-question-mark";

	async init() {
		this.renderer.window.rename(this.args[1] || "Popup");
		this.renderer.setWindowIcon("scroll-text");

		if (this.args.length == 0) {
			throw new Error("Popup initialised with no params.");
		}

		this.params = {
			type: this.args[0] || "log",
			title: this.args[1] || "",
			description: this.args[2] || "",
			error: this.args[3] || ""
		};

		switch (this.params.type) {
			case "log":
				this.icon = "scroll-text";
				break;
			case "warning":
				this.icon = "triangle-alert";
			case "error":
				this.icon = "octagon-x";
				break;
		}

		this.renderer.setWindowIcon(this.icon);
	}

	frame() {
		this.renderer.clear();

		this.renderer.text(85, 37, this.params.description, 20);
		this.renderer.text(85, 85, String(this.params.error));
		this.renderer.icon(25, 25, this.icon, 2);

		this.renderer.commit();
	}
}
