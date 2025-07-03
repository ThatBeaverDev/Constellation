export default class body {
	constructor(parent) {
		this.parent = parent;

		this.init();
	}

	async init() {
		const dir = env.fs.relative(
			this.parent.directory,
			"resources/pages/index.js"
		);
		const include = await env.include(dir);
		this.pages = await include.default(this.parent);

		this.location = "home";

		this.initialised = true;
	}

	async renderStructure(struct) {
		const title = struct.title;
		const items = struct.items;

		const r = this.parent.renderer;
		const x = 110;
		let y = 0;

		for (const item of items) {
			switch (item.type) {
				case "link":
					r.button(
						x,
						y,
						item.text,
						() => {
							this.location = item.href;
						},
						() => {},
						13
					);
					break;

				case "titleCard":
					r.text(x, y, item.text, 10);
					break;

				case "optionsList":
					r.text(x, y, item.text, 13);

					if (item.value == undefined) {
						item.value = await item.getValue();
					}

					for (const val of item.options) {
						y += 15;

						const pre = item.value == val ? ">  " : "  ";
						const text = pre + val;

						r.button(
							x,
							y,
							text,
							() => {
								item.setValue(val);
							},
							() => {},
							13
						);
					}

					break;

				default:
					throw new Error(
						"Unknown jsonRenderStructure type: '" + item.type + "'"
					);
			}

			y += 15;
		}
	}

	async render() {
		if (this.initialised !== true) return;

		await this.renderStructure(this.pages[this.location]);
	}
}
