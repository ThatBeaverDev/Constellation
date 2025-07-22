import { IPCMessage } from "../../../messages";

type fileInfo = {
	directory: string;
	name: string;
	icon: string;
};

export default class KeystoneSearch extends Popup {
	pathinf: any;
	fzfLib: any;

	results: object[] = [];
	files: string[] = [];
	fileInfo: fileInfo[] = [];
	searchInterval: number = 0;
	ok: boolean = true;
	entries: any;
	rendering: any[] = [];
	selector: number = 0;

	async init() {
		this.renderer.window.rename("Keystone Search");
		this.renderer.setWindowIcon("search");

		this.registerKeyboardShortcut("ScrollDown", "ArrowDown", []);
		this.registerKeyboardShortcut("ScrollUp", "ArrowUp", []);
		this.registerKeyboardShortcut("Open", "Enter", []);

		this.fzfLib = await this.env.include("/System/CoreLibraries/fzf.js");
		this.pathinf = await this.env.include(
			"/System/CoreLibraries/pathinf.js"
		);

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

	async index(
		directories = [
			"/System/CoreExecutables",
			"/Applications" /*,
			"~/Applications"*/
		]
	) {
		let files: fileInfo[] = [];
		let names: string[] = [];

		for (const directory of directories) {
			const list = await this.env.fs.listDirectory(directory);
			if (!list.ok) throw list.data;

			const localNames = list.data.map((item: string) =>
				this.env.fs.resolve(directory, String(item))
			);
			names = [...localNames, ...names];

			// build file objects
			const localFiles = localNames.map((dir: string) => {
				return {
					directory: dir,
					name: this.pathinf.pathName(dir),
					icon: this.pathinf.pathIcon(dir)
				};
			});

			for (const vl of localFiles) {
				vl.icon = await vl.icon;
				vl.name = await vl.name;

				if (
					vl.directory.endsWith(".backgr") ||
					vl.directory.endsWith(".appl")
				) {
					if (vl.name.startsWith("/")) {
						vl.name = vl.directory.textAfterA;
						("/");
					}
				}
			}

			files = [...localFiles, ...files];
		}

		return {
			files,
			names
		};
	}

	async search(term: string) {
		const fzf = new this.fzfLib.Fzf(this.files);

		// object stating item, score and start/end points
		this.entries = fzf.find(term);
		// just names
		this.results = this.entries.map((result: any) => {
			return String(result.item);
		});

		// prevent rendering
		this.ok = false;

		// file info
		// @ts-expect-error // it refuses to believe that item is a string, even though above it is forced to be one. typical.
		this.rendering = this.results.map((item: string) => {
			for (const itm of this.fileInfo) {
				if (itm.directory == item) {
					return itm;
				}
			}
		});

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
						throw new Error(
							"Unknown keyboard shortcut name (intent): " + intent
						);
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

		this.renderer.textbox(
			0,
			0,
			this.renderer.window.dimensions.width,
			40,
			"Search for apps...",
			{
				update: () => this.search,
				enter: () => {}
			}
		);

		let y = 50;
		for (const idx in this.rendering) {
			const itm = this.rendering[idx];

			this.renderer.icon(10, y, itm.icon);

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
