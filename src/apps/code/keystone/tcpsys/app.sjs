const fzfLib = await env.include("/System/CoreLibraries/fzf.sjs");
const pathinf = await env.include("/System/CoreLibraries/pathinf.sjs");

export default class KeystoneSearch extends Popup {
	async init() {
		this.renderer.window.rename("Keystone Search");

		await this.search("");

		this.results = [];

		this.registerKeyboardShortcut("ScrollDown", "ArrowDown", []);
		this.registerKeyboardShortcut("ScrollUp", "ArrowUp", []);
		this.registerKeyboardShortcut("Open", "Enter", []);

		this.searchInterval = setInterval(async () => {
			const query = this.renderer.getTextboxContent();

			this.search(query)
		}, 500);

		this.ok = true;
	}

	async search(
		term,
		directories = [
			"/System/CoreExecutables",
			"/Applications" /*,
			"~/Applications"*/
		]
	) {
		let bigList = [];

		for (const directory of directories) {
			const list = await env.fs.listDirectory(directory);
			if (!list.ok) throw list.data;

			const mapped = list.data.map((item) =>
				env.fs.relative(directory, String(item))
			);

			bigList = [...bigList, ...mapped];
		}

		const fzf = new fzfLib.Fzf(bigList);

		// object stating item, score and start/end points
		this.entries = fzf.find(term);
		// just names
		this.results = this.entries.map((result) => result.item);

		// prevent rendering
		this.ok = false;

		// icon info
		this.rendering = this.results.map((item) => {
			return {
				directory: item,
				name: item,
				icon: undefined
			};
		});

		for (const itm of this.rendering) {
			itm.name = await pathinf.pathName(itm.directory);
			itm.icon = await pathinf.pathIcon(itm.directory);
		}

		// allow rendering again
		this.ok = true;
	}

	async onmessage(origin, intent) {
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
						const item = this.rendering[this.selector]

						env.exec(item.directory)
						this.exit()
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
				update: () => {},
				enter: () => {}
			}
		);

		let y = 50;
		for (const idx in this.rendering) {
			const itm = this.rendering[idx];

			this.renderer.icon(0, y, itm.icon);

			const pre = this.selector == idx ? "> " : "  "

			this.renderer.button(30, y, pre + (itm.name || itm.directory));
			y += 27.5;
		}

		this.renderer.commit();
	}

	terminate() {
		clearInterval(this.searchInterval)
	}
}
