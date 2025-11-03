import { fileInfo } from "../lib/appfind.js";
import { Fzf } from "fzf";

export default class KeystoneSearch extends Overlay {
	results: object[] = [];
	files: string[] = [];
	fileInfo: fileInfo[] = [];
	searchInterval?: ReturnType<typeof setInterval>;
	ok: boolean = true;
	entries: any;
	rendering: any[] = [];
	selector: number = 0;
	counter: number = 0;

	async init() {
		this.renderer.windowName = "Keystone Search";
		this.renderer.setIcon("search");

		await this.env.shell.index();

		this.index = async () => {
			const result = await this.env.shell.exec("appfind");

			return result?.result;
		};

		const obj = await this.index();

		this.files = obj.names;
		this.fileInfo = obj.files;

		await this.search("");
	}

	index?: Function;

	async search(term: string) {
		const fuzzyFinder = new Fzf(this.files);

		// object stating item, score and start/end points
		const entries = fuzzyFinder.find(term);

		// just names
		const results: string[] = entries.map(
			(result: { item: string }): string => result.item
		);

		// prevent rendering
		this.ok = false;

		// file info
		this.rendering = results
			.map((item: string) => {
				for (const itm of this.fileInfo) {
					if (itm.directory == item) {
						if (itm.visible) {
							return itm;
						}
					}
				}
			})
			.filter((item: fileInfo | undefined) => item?.visible == true);

		// allow rendering again
		this.ok = true;
	}

	selectItem(index = this.selector) {
		if (this.selector == undefined || this.renderer == undefined) return;

		const item = this.rendering[index];

		this.env.exec(item.directory);
		this.exit();
	}

	keydown(
		code: string,
		metaKey: boolean,
		altKey: boolean,
		ctrlKey: boolean,
		shiftKey: boolean,
		repeat: boolean
	): void | Promise<void> {
		if (metaKey || altKey || ctrlKey || shiftKey) return;

		switch (code) {
			case "ArrowDown":
				this.selector++;
				break;
			case "ArrowUp":
				this.selector--;
				break;
			case "Enter":
				this.selectItem(this.selector);
				break;
		}
	}
	frame() {
		if (this.ok !== true) {
			return;
		}

		if (this.selector == undefined) {
			this.selector = 0;
		}

		this.renderer.clear();

		const textbox = this.renderer.textbox(
			0,
			0,
			this.renderer.windowWidth,
			40,
			"Search for apps...",
			{
				update: () => this.search,
				enter: () => {
					this.selectItem(this.selector);
				}
			}
		);

		if (++this.counter == 0) {
			this.searchInterval = setInterval(async () => {
				const query = this.renderer.getTextboxContent(textbox);

				if (query == null) {
					return;
				}

				await this.search(query);
			}, 250);
		}

		let y = 50;
		for (const idx in this.rendering) {
			const itm = this.rendering[idx];

			this.renderer.icon(10, y, itm.icon, undefined, undefined, {
				noProcess: true
			});

			const pre = this.selector == Number(idx) ? "> " : "  ";

			this.renderer.button(
				40,
				y,
				pre + (itm.name || itm.directory),
				async () => {
					this.selectItem(Number(idx));
				}
			);
			y += 27.5;
		}

		this.renderer.commit();
	}

	async terminate() {
		clearInterval(this.searchInterval);
	}
}
