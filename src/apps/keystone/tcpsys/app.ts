import { IPCMessage } from "../../messages";
import { fileInfo } from "../lib/appfind";

export default class KeystoneSearch extends Popup {
	pathinf?: typeof import("../../../syslib/pathinf");
	fzfLib?: typeof import("../../../lib/external/fzf");

	results: object[] = [];
	files: string[] = [];
	fileInfo: fileInfo[] = [];
	searchInterval: number = 0;
	ok: boolean = true;
	entries: any;
	rendering: any[] = [];
	selector: number = 0;

	async init() {
		this.renderer.windowName = "Keystone Search";
		this.renderer.setIcon("search");

		this.registerKeyboardShortcut("ScrollDown", "ArrowDown", []);
		this.registerKeyboardShortcut("ScrollUp", "ArrowUp", []);
		this.registerKeyboardShortcut("Open", "Enter", []);

		this.fzfLib = await this.env.include("/System/CoreLibraries/fzf.js");
		this.pathinf = await this.env.include("/System/CoreLibraries/pathinf.js");

		await this.env.shell.index();

		this.index = async () => {
			const result = await this.env.shell.exec("appfind");

			return result?.result;
		};

		const obj = await this.index();

		this.files = obj.names;
		this.fileInfo = obj.files;

		await this.search("");
		this.searchInterval = setInterval(async () => {
			const query = this.renderer.getTextboxContent();

			if (query == null) {
				return;
			}

			await this.search(query);
		}, 250);
	}

	index?: Function;

	async search(term: string) {
		if (this.fzfLib == undefined) return;

		const fzf = new this.fzfLib.Fzf(this.files);

		// object stating item, score and start/end points
		const entries = fzf.find(term);

		// just names
		const results: string[] = entries.map((result: { item: string }): string => result.item);

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
		const item = this.rendering[index];

		this.env.exec(item.directory);
		this.exit();
	}

	async onmessage(msg: IPCMessage) {
		const origin = msg.originDirectory;
		const intent = msg.intent;

		switch (origin) {
			case "/System/keyboardShortcuts.js":
				switch (intent) {
					case "keyboardShortcutTrigger-ScrollDown":
						this.selector++;
						break;
					case "keyboardShortcutTrigger-ScrollUp":
						this.selector--;
						break;
					case "keyboardShortcutTrigger-Open": {
						this.selectItem(this.selector);
						break;
					}
					default:
						throw new Error("Unknown keyboard shortcut name (intent): " + intent);
				}
				break;
			default:
				console.warn("Unknown message sender: " + origin);
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

		this.renderer.textbox(0, 0, this.renderer.windowWidth, 40, "Search for apps...", {
			update: () => this.search,
			enter: () => {
				this.selectItem(this.selector);
			}
		});

		let y = 50;
		for (const idx in this.rendering) {
			const itm = this.rendering[idx];

			this.renderer.icon(10, y, itm.icon);

			const pre = this.selector == Number(idx) ? "> " : "  ";

			this.renderer.button(40, y, pre + (itm.name || itm.directory), async () => {
				this.selectItem(Number(idx));
			});
			y += 27.5;
		}

		this.renderer.commit();
	}

	async terminate() {
		clearInterval(this.searchInterval);
	}
}
