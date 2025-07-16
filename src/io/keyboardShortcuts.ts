import { BackgroundProcess, Process } from "../apps/executables.js";
import { sendMessage } from "../apps/messages.js";
import { focus, windows } from "../windows/windows.js";

export const keyboardShortcuts: any = {};

declare global {
	interface Window {
		keyboardShortcuts: any;
	}
}
window.keyboardShortcuts = keyboardShortcuts;

type modifier =
	| "ShiftLeft"
	| "ShiftRight"
	| "MetaLeft"
	| "MetaRight"
	| "ControlLeft"
	| "ControlRight"
	| "AltLeft"
	| "AltRight";

interface keyboardShortcut {
	app: string;
	name: string;
	key: string;
	modifiers: modifier[] | string[];
	process: Process;
}

export function registerKeyboardShortcut(
	process: Process,
	name: string,
	key: string,
	modifiers: modifier[] | string[]
) {
	const cut: keyboardShortcut = {
		process: process,
		app: process.directory,
		name: name,
		key: key,
		modifiers: modifiers
	};

	keyboardShortcuts[process.directory + "://" + name] = cut;
}

export function updateKeyboardShortcut(
	id: string,
	key: string,
	modifiers: string[]
) {
	const k = keyboardShortcuts[id];
	k.key = key;
	k.modifiers = modifiers;
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
			// insure the process is allowed to execute shortcuts
			const isBackground = cut?.process instanceof BackgroundProcess;
			const isFocused = cut?.process?.renderer?.window?.winID == focus;

			const allowed = isBackground || isFocused;

			if (!allowed) {
				continue;
			}

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
					case "MetaLeft":
					case "MetaRight":
						if (!meta) {
							ok = false;
						}
						break;
					case "ControlLeft":
					case "ControlRight":
						if (!ctrl) {
							ok = false;
						}
						break;
					default:
						console.warn("Unknown Modfier key: '" + mod + "'");
				}
			}

			if (ok) {
				// trigger the shortcut
				sendMessage(
					"/System/keyboardShortcuts.js",
					0,
					cut.process.id,
					"keyboardShortcutTrigger-" + cut.name
				);

				e.preventDefault();
			}
		}
	}
});
