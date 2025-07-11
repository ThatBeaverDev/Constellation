const fzfLib = await env.include("/System/CoreLibraries/fzf.sjs");
const pathinf = await env.include("/System/CoreLibraries/pathinf.sjs");

async function index(
	directories = [
		"/System/CoreExecutables",
		"/Applications" /*,
			"~/Applications"*/
	]
) {
	let files = [];
	let names = [];

	for (const directory of directories) {
		const list = await env.fs.listDirectory(directory);
		if (!list.ok) throw list.data;

		const localNames = list.data.map((item) =>
			env.fs.relative(directory, String(item))
		);
		names = [...localNames, ...names];

		// build file objects
		const localFiles = localNames.map((dir) => {
			return {
				directory: dir,
				name: pathinf.pathName(dir),
				icon: pathinf.pathIcon(dir)
			};
		});

		for (const i in localFiles) {
			localFiles[i].name = await localFiles[i].name;
			localFiles[i].icon = await localFiles[i].icon;
		}

		files = [...localFiles, ...files];
	}

	return {
		files,
		names
	};
}

export default class KeystoneSearch extends Popup {
	async init() {
		this.renderer.window.rename("Keystone Search");

		this.results = [];

		this.registerKeyboardShortcut("ScrollDown", "ArrowDown", []);
		this.registerKeyboardShortcut("ScrollUp", "ArrowUp", []);
		this.registerKeyboardShortcut("Open", "Enter", []);

		const obj = await index();
		this.files = obj.names;
		this.fileInfo = obj.files;

		await this.search("");
		this.searchInterval = setInterval(async () => {
			const query = this.renderer.getTextboxContent();

			await this.search(query);
		}, 250);

		this.ok = true;
	}

	async search(term) {
		const fzf = new fzfLib.Fzf(this.files);

		// object stating item, score and start/end points
		this.entries = fzf.find(term);
		// just names
		this.results = this.entries.map((result) => result.item);

		// prevent rendering
		this.ok = false;

		// file info
		this.rendering = this.results.map((item) => {
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

		env.exec(item.directory);
		this.exit();
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

			const pre = this.selector == idx ? "> " : "  ";

			this.renderer.button(
				40,
				y,
				pre + (itm.name || itm.directory),
				async () => {
					this.selectItem(idx);
				}
			);
			y += 27.5;
		}

		this.renderer.commit();
	}

	terminate() {
		clearInterval(this.searchInterval);
	}
}
