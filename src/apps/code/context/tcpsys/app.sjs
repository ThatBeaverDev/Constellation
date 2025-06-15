export default class context_bar extends Process {
	init() {
		this.padding = 10;
	}

	resize(width, height) {
		if (this.renderer.window.width !== width || this.renderer.window.height !== height) {
			this.renderer.window.move(-1, -25);
			this.renderer.window.resize(width, height);
		}
	}

	keydown(key, cmd, opt, ctrl) {
		if (key == "ArrowDown") {
			if (opt) {
				// summon search bar
				this.os.exec("/System/CoreExecutables/com.constellation.search");
			}
		}
	}

	keyup(key) {}

	textWidth(text) {
		const charWidth = 15 * 0.6;
		const textWidth = text.length * charWidth;

		return textWidth;
	}

	writeText(text) {
		this.renderer.text(this.x, 3, text);

		// padding
		this.x += this.textWidth(text);
		this.x += this.padding;
	}

	drawIcon(name) {
		this.renderer.icon(this.x, 0, name);

		// padding
		this.x += 24;
		this.x += this.padding;
	}

	frame() {
		this.resize(window.innerWidth + 2, 50);

		this.renderer.clear();

		const isDev = window.location.hostname == "localhost";

		this.x = Number(this.padding);
		if (isDev) {
			this.drawIcon("circuit-board");
		} else {
			this.drawIcon("telescope");
		}

		this.writeText("Apps");
		this.writeText("File");
		this.writeText("Edit");
		this.writeText("View");
		this.writeText("Help");

		this.renderer.commit();
	}

	terminate() {}
}
