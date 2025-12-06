import { fileInfo } from "../lib/appfind.js";
import { Fzf } from "fzf";
import PanelKit from "/System/CoreLibraries/panelkit.js";

export default class KeystoneSearch extends Overlay {
	panelkit = new PanelKit(this.renderer);

	results: object[] = [];
	files: string[] = [];
	fileInfo: fileInfo[] = [];
	ok: boolean = true;
	entries: any;
	rendering: fileInfo[] = [];
	counter: number = 0;

	async init() {
		this.renderer.windowName = "Keystone Search";
		this.renderer.setIcon("./resources/icon.svg");

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
		// @ts-expect-error
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

	selectItem(index: number) {
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
		this.panelkit.keydown(code, metaKey, altKey, ctrlKey, shiftKey, repeat);
	}

	frame() {
		if (this.ok !== true) {
			return;
		}

		this.renderer.clear();
		this.panelkit.reset();
		this.panelkit.sidebarWidth = 0;

		const textbox = this.renderer.textbox(
			0,
			0,
			this.renderer.windowWidth,
			40,
			"Search for apps...",
			{
				update: () => {
					this.panelkit.keyboardFocus = 1;
					this.search(textbox.getContents() ?? "");
				}
			}
		);

		if (this.counter++ % 50 == 0) {
			const query = this.renderer.getTextboxContent(textbox);

			if (query == null) {
				return;
			}

			this.search(query);
		}

		this.panelkit.blankSpace(40);

		for (const index in this.rendering) {
			const item = this.rendering[index];

			this.panelkit.card(item.name, item.icon, () => {
				this.selectItem(Number(index));
			});
		}

		this.renderer.commit();
	}

	async terminate() {}
}
