import { Process } from "../runtime/executables.js";
import { sendMessage } from "../runtime/messages.js";
import { focusedWindow, getWindowOfId } from "../windows/windows.js";

export const keyboardShortcuts: Map<[Process, string], keyboardShortcut> =
	new Map();

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

	const map: [Process, string] = [process, name];

	keyboardShortcuts.set(map, cut);
}

document.addEventListener("keydown", (e) => {
	const targetWindow = getWindowOfId(focusedWindow);
	const keyCode = e.code;

	const meta = e.metaKey;
	const option = e.altKey;
	const shift = e.shiftKey;
	const ctrl = e.ctrlKey;

	for (const [shortcutName, cut] of keyboardShortcuts.entries()) {
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
					cut.process,
					"keyboardShortcutTrigger-" + cut.name
				);

				e.preventDefault();
			}
		}
	}
});
