const isMac = window.navigator.platform == "MacIntel";

export function translateKeyName(key: KeyboardEvent["code"]) {
	switch (key) {
		case "AltLeft":
			return "Left Alt";
		case "AltRight":
			return "Right Alt";
		case "MetaLeft":
			if (isMac) {
				return "Left Command";
			} else {
				return "Left Super";
			}
		case "MetaRight":
			if (isMac) {
				return "Right Command";
			} else {
				return "Right Super";
			}
		case "ShiftLeft":
			return "Left Shift";
		case "ShiftRight":
			return "Right Shift";
		case "ControlLeft":
			return "Left Control";
		case "ControlRight":
			return "Right Control";

		case "Space":
			return " ";
		case "Enter":
			return "Enter";
		case "Backspace":
			return "Backspace";
		case "Escape":
			return "Escape";

		case "ArrowDown":
			return "Down Arrow";
		case "ArrowUp":
			return "Up Arrow";
		case "ArrowLeft":
			return "Left Arrow";
		case "ArrowRight":
			return "Right Arrow";

		case "KeyA":
			return "a";
		case "KeyB":
			return "b";
		case "KeyC":
			return "c";
		case "KeyD":
			return "d";
		case "KeyE":
			return "e";
		case "KeyF":
			return "f";
		case "KeyG":
			return "g";
		case "KeyH":
			return "h";
		case "KeyI":
			return "i";
		case "KeyJ":
			return "j";
		case "KeyK":
			return "k";
		case "KeyL":
			return "l";
		case "KeyM":
			return "m";
		case "KeyN":
			return "n";
		case "KeyO":
			return "o";
		case "KeyP":
			return "p";
		case "KeyQ":
			return "q";
		case "KeyR":
			return "r";
		case "KeyS":
			return "s";
		case "KeyT":
			return "t";
		case "KeyU":
			return "u";
		case "KeyV":
			return "v";
		case "KeyW":
			return "w";
		case "KeyX":
			return "x";
		case "KeyY":
			return "y";
		case "KeyZ":
			return "z";

		default:
			console.debug(
				"keyboardUtils.js : translateKeyName does not support key '" +
					key +
					"' and has been forced to fallback."
			);
	}

	return key;
}
