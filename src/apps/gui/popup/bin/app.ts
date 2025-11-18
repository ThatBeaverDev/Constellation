export default class Dialogue extends Overlay {
	params!: {
		type: string;
		title: string;
		description: string;
		error: string;
		options: string[];
	};
	icon: string = "circle-question-mark";
	pipe: any[] = [];

	async init() {
		this.renderer.windowName = this.args[1] || "Popup";
		this.renderer.setIcon("scroll-text");

		if (this.args.length == 0) {
			throw new Error("Popup initialised with no params.");
		}

		this.params = {
			type: this.args[0] || "log",
			title: this.args[1] || "",
			description: this.args[2] || "",
			error: this.args[3] || "",
			options: this.args[4] || []
		};

		this.pipe = this.args[5] || [];

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

		this.renderer.setIcon(this.icon);
	}

	frame() {
		this.renderer.clear();

		this.renderer.icon(25, 25, this.icon, 2);
		this.renderer.text(85, 37, this.params.description, 20);

		let x = 25;
		const opts = this.params.options;

		for (const text of opts) {
			this.renderer.button(x, 85, text, () => {
				this.pipe.push({
					intent: "popupResult",
					data: text
				});

				this.exit();
			});

			x += 25 + this.renderer.getTextWidth(text);
		}

		this.renderer.text(25, 105, String(this.params.error));

		this.renderer.commit();
	}
}
