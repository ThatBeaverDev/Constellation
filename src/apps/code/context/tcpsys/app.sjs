const apps = await import("/System/apps.js");
const windows = await import("/System/windows.js");

export default class context_bar extends Application {
	async init() {
		this.padding = 10;
		this.isDev = window.location.hostname == "localhost";
		if (this.isDev) {
			const elements = document.getElementsByClassName("bootCover");
			const array = [].slice.call(elements);
			array.forEach((item) => item.remove());

			// fetch when the system was last recompiled
			this.compiled = await (await fetch("/build/date.txt")).text();
		}
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
		return this.renderer.getTextWidth(text, 15, "monospace");
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

	drawButton(text, callback) {
		this.renderer.button(this.x, 3, text, callback);

		// padding
		this.x += this.textWidth(text);
		this.x += this.padding;
	}

	frame() {
		this.resize(window.innerWidth + 2, 50);

		this.renderer.clear();

		this.x = Number(this.padding);
		if (this.isDev) {
			this.drawIcon("circuit-board");
		} else {
			this.drawIcon("telescope");
		}

		const targetApp = apps.processes[windows.focus];
		let focusName;

		if (targetApp == undefined) {
			focusName = "System";
		} else {
			focusName = targetApp.renderer.window.name;
		}

		this.drawButton(focusName);
		this.drawButton("Files", () => {
			this.os.exec("/System/CoreExecutables/com.constellation.finder");
		});
		this.drawButton("Edit");
		this.drawButton("View");
		this.drawButton("Help");

		if (this.isDev) {
			const ago = (Date.now() - this.compiled) / 1000;
			this.writeText("           Last Build was " + Math.floor(ago) + " Seconds ago.");
		}

		this.renderer.commit();
	}

	terminate() {}
}
