const fsDisplayLib = await env.include("/System/CoreLibraries/pathicon.sjs");

const mod = (n, modulus) => {
	let result = n % modulus;
	if (result / modulus < 0) result += modulus;
	return result;
};
const clamp = (n, min, max) => {
	if (n < min) {
		return min;
	}
	if (max < n) {
		return max;
	}

	return n;
};

export default class finder extends Application {
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

	async init() {
		this.padding = 1;

		await this.cd("/");

		this.renderer.window.rename("Finder");

		this.keyLocations = {
			Constellation: "/",
			System: "/System",
			Users: "/Users"
		};

		setInterval(() => {
			this.cd(this.path);
		}, 500);
	}

	async keydown(key, cmd, opt, ctrl, shift, isRepeat) {
		if (opt) {
			switch (key) {
				case "KeyG":
					// select directory prompt
					this.cd(prompt("Select a directory"));
					break;
			}
			return;
		}

		// simple keypress
		let speed = 1;
		if (shift) {
			speed++;
		}
		switch (key) {
			case "ArrowDown":
				if (cmd) {
					const obj = this.listing[this.selector];
					this.cd(obj.path);
					this.selector = undefined;
				} else {
					this.selector = clamp(this.selector + speed, 0, this.listing.length - 1);
				}
				break;
			case "ArrowUp":
				if (cmd) {
					const oldDir = String(this.path);

					await this.cd("..");
					this.selector = 0;
					for (const i in this.listing) {
						const obj = this.listing[i];
						console.log(obj);

						if (obj.path == oldDir) {
							this.selector = i;
							break;
						}
					}
				} else {
					this.selector = clamp(this.selector - speed, 0, this.listing.length - 1);
				}
				break;
		}
	}

	async cd(directory) {
		const oldDir = String(this.path);

		this.path = env.fs.relative(this.path, directory);
		const dir = this.path;
		if (this.path == "/") {
			this.location = "Constellation";
		} else {
			this.location = "Constellation" + String(this.path).replaceAll("/", " > ");
		}

		const list = await env.fs.listDirectory(dir);
		if (!list.ok) {
			this.path = oldDir;
			return;
		}
		this.listing = list.data;

		const newIcon = await fsDisplayLib.pathIcon(this.path);
		if (newIcon !== this.icon) {
			this.icon = newIcon;
			this.renderer.setWindowIcon(this.icon);
		}

		this.listing.sort();

		this.listing = this.listing.map((name) => {
			const obj = {};
			obj.name = name;
			obj.path = env.fs.relative(this.path, name);
			obj.icon = fsDisplayLib.pathIcon(obj.path);

			return obj;
		});
	}

	async frame() {
		if (this.selector == undefined) {
			this.selector = 0;
		}

		this.renderer.clear();

		if (this.listing == undefined) {
			return;
		}

		this.renderer.icon(20, 0, await this.icon);
		this.renderer.text(50, 0, this.path);

		let y = 30;
		for (const i in this.listing) {
			const obj = this.listing[i];

			this.renderer.icon(20, y, await obj.icon);

			const name = obj.name.padEnd(25, " ");
			const text = this.selector == i ? "> " + name : "  " + name;

			this.renderer.button(
				50,
				y,
				text,
				async () => {
					// right click
					await this.cd(obj.path);
				},
				async () => {
					// left click
				}
			);

			y += 25;
		}

		this.renderer.commit();
	}
}
