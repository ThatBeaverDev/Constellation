import { Process } from "./apps/executables.js";
import { focus, windows } from "./windows.js";
import conf from "./constellation.config.js";
import fs from "./fs.js";

const shortcutsFile = conf.shortcutsFile;

async function readShortcuts(): Promise<Object> {
	const text = await fs.readFile(shortcutsFile);

	if (text == undefined) {
		return {};
	}

	const json = JSON.parse(text);

	return json;
}

export const keyboardShortcuts: any = await readShortcuts();

declare global {
	interface Window {
		keyboardShortcuts: any;
	}
}
window.keyboardShortcuts = keyboardShortcuts;

type modifier = "ShiftLeft" | "ShiftRight" | "MetaLeft" | "MetaRight" | "ControlLeft" | "ControlRight" | "AltLeft" | "AltRight";

type reducedKeyboardShortcut = {
	app: string;
	name: string;
	key: string;
	modifiers: modifier[] | string[];
};

interface keyboardShortcut extends reducedKeyboardShortcut {
	process: Process;
}

// function to store shortcuts on disk
async function commitShortcuts() {
	const toCommit: any = {};

	for (const id in keyboardShortcuts) {
		const cut = keyboardShortcuts[id];

		const obj: reducedKeyboardShortcut = {
			app: cut.app,
			name: cut.name,
			key: cut.key,
			modifiers: cut.modifiers
		};

		toCommit[id] = obj;
	}

	await fs.writeFile(shortcutsFile, JSON.stringify(toCommit));
}

export async function registerKeyboardShortcut(process: Process, name: string, key: string, modifiers: modifier[] | string[]) {
	const cut: keyboardShortcut = {
		process: process,
		app: process.directory,
		name: name,
		key: key,
		modifiers: modifiers
	};

	keyboardShortcuts[process.directory + "://" + name] = cut;

	await commitShortcuts();
}

export async function updateKeyboardShortcut(id: string, key: string, modifiers: string[]) {
	const k = keyboardShortcuts[id];
	k.key = key;
	k.modifiers = modifiers;

	await commitShortcuts();
}

document.addEventListener("keydown", (e) => {
	const targetWindow = windows[focus];
	const keyCode = e.code;

	const meta = e.metaKey;
	const option = e.altKey;
	const shift = e.shiftKey;
	const ctrl = e.ctrlKey;

	//console.log(keyCode, meta, option, shift, ctrl);
	const k = keyboardShortcuts;

	for (const i in k) {
		const cut = k[i];

		// insure the right main key is pressed
		if (keyCode == cut.key) {
			// loop through all the necessary modifiers to insure they are all pressed
			let ok = true;
			for (const i in cut.modifiers) {
				const mod = cut.modifiers[i];
				switch (mod) {
					case "AltLeft":
					case "AltRight":
						if (!option) {
							ok = false;
						}
						break;
					case "ShiftLeft":
					case "ShiftRight":
						if (!shift) {
							ok = false;
						}
						break;
					default:
						console.warn("Unknown Modfier key: '" + mod + "'");
				}
			}

			if (ok) {
				// run the shortcut
				cut.process.onmessage("/System/keyboardShortcuts.js", "keyboardShortcutTrigger-" + cut.name);
			}
		}
	}
});
