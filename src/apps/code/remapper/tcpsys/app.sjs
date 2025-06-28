const clamp = (n, min, max) => {
	if (n == undefined) {
		return min;
	}
	if (n < min) {
		return min;
	}
	if (max < n) {
		return max;
	}

	return n;
};

const camelCaseToNormal = (text) => {
	const result = text.replace(/([A-Z])/g, " $1");
	return result.charAt(0).toUpperCase() + result.slice(1);
};

export default class remapper extends Application {
	async init() {
		this.renderer.window.rename("Keybinding Remapper");

		this.registerKeyboardShortcut("ScrollDown", "ArrowDown", []);
		this.registerKeyboardShortcut("ScrollUp", "ArrowUp", []);
		this.registerKeyboardShortcut("Select", "Enter", []);
		this.registerKeyboardShortcut("Reload", "KeyR", ["ShiftLeft"]);
		this.keys = {};

		this.mode = "listing";

		await this.refresh();
		this.refreshLoop = setInterval(this.refresh, 1000);

		const keyboardUtils = await env.include("/System/CoreLibraries/keyboardUtils.sjs");

		this.translateKeyName = keyboardUtils.translateKeyName;
	}

	async refresh() {
		const keys = await env.sysinclude("/System/keybindings.js");

		this.keys = keys.keyboardShortcuts;
		this.updateKeyboardShortcut = keys.updateKeyboardShortcut;

		let arr = [];
		for (const i in this.keys) {
			arr.push({
				id: i,
				...this.keys[i]
			});
		}
		arr.sort();
		this.arr = arr;
	}

	onmessage(origin, intent) {
		switch (origin) {
			case "/System/keyboardShortcuts.js":
				switch (intent) {
					case "keyboardShortcutTrigger-ScrollDown":
						this.selector++;
						break;
					case "keyboardShortcutTrigger-ScrollUp":
						this.selector--;
						break;
					case "keyboardShortcutTrigger-Select":
						this.mode = "enterKey";
						break;
					case "keyboardShortcutTrigger-Reload":
						this.refresh();
						break;
					default:
						throw new Error("Unknown keyboard shortcut name (intent): " + intent);
				}
				break;
			default:
				console.warn("Unknown message sender: " + origin);
		}
	}

	keydown(key, cmd, opt, ctrl, shift, isRepeat, keyName) {
		if (this.mode == "enterKey") {
			switch (key) {
				case "ArrowUp":
				case "ArrowDown":
				case "Enter":
					// insure the user can't override these keys
					break;
				default:
					const isKey = key.startsWith("Key");
					const isNumber = key.startsWith("Digit");

					if (!isKey && !isNumber) {
						return;
					}

					const modifiers = new Set([]);

					if (cmd) modifiers.add("MetaLeft");
					if (opt) modifiers.add("AltLeft");
					if (ctrl) modifiers.add("ControlLeft");
					if (shift) modifiers.add("ShiftLeft");

					const k = this.arr[this.selector];
					k.key = key;
					k.modifiers = [...modifiers];
					this.updateKeyboardShortcut(k.app + "://" + k.name, key, [...modifiers]);

					this.mode = "listing";
			}
		}
	}

	frame() {
		this.renderer.clear();
		this.selector = clamp(this.selector, 0, this.arr.length);

		switch (this.mode) {
			case "listing":
				if (this.arr == undefined) {
					return;
				}

				let y = 0;
				for (const i in this.arr) {
					const k = this.arr[i];

					// app name
					const appName = k.app.textAfterAll(".");
					const name = k.name;
					const titleText = appName + " - " + name;

					let modifierText = "";
					if (k.modifiers.length !== 0) {
						modifierText += k.modifiers.map(this.translateKeyName).join(" + ") + " + ";
					}
					modifierText += this.translateKeyName(k.key);

					this.renderer.text(0, y, titleText);
					if (this.selector == i) {
						this.renderer.text(0, y + 20, "> " + modifierText, 13);
					} else {
						this.renderer.text(0, y + 20, "  " + modifierText, 13);
					}

					y += 45;
				}
				break;
			case "enterKey":
				break;
		}

		this.renderer.commit();
	}

	terminate() {
		clearInterval(this.refreshLoop);
	}
}
