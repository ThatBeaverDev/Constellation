import systemSettings from "../../tcpsys/app.js";

export default class body {
	constructor(parent: systemSettings) {
		this.parent = parent;

		this.init();
	}

	parent: systemSettings;
	pages: any;
	location: string = "home";
	initialised: boolean = false;

	async init() {
		const dir = this.parent.env.fs.resolve(
			this.parent.directory,
			"resources/pages/index.js"
		);
		const include = await this.parent.env.include(dir);
		this.pages = await include.default(this.parent);

		this.location = "home";

		this.initialised = true;
	}

	async renderStructure(struct: {
		title: string;
		items: (
			| { type: "link"; text: string; href: string }
			| { type: "titleCard"; text: string }
			| {
					type: "optionsList";
					text: string;
					options: string[];
					default: any;
					getValue: Function;
					setValue: Function;
					value?: any;
			  }
		)[];
	}) {
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
			}

			y += 15;
		}
	}

	async render() {
		if (this.initialised !== true) return;

		await this.renderStructure(this.pages[this.location]);
	}
}
