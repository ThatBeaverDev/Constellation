import { Renderer } from "./uiKit";

export default class UIKitEventListeners {
	#parent: Renderer;
	get #signal() {
		return this.#parent.signal;
	}
	constructor(parent: Renderer) {
		this.#parent = parent;
	}

	uikitButton(
		element: HTMLButtonElement,
		x = 0,
		y = 0,
		string = "",
		leftClickCallback = () => {},
		rightClickCallback = () => {},
		size: number
	) {
		element.addEventListener(
			"pointerdown",
			(event: MouseEvent) => {
				event.preventDefault();
				switch (event.button) {
					case 0:
						// left click
						leftClickCallback();
						break;
					case 1:
						// middle click
						// unused
						break;
					case 2:
						// right click
						rightClickCallback();
						break;
				}
			},
			{
				signal: this.#signal
			}
		);
	}

	uikitTextbox(
		element: HTMLInputElement,
		x = 0,
		y = 0,
		width = 200,
		height = 20,
		backtext = "",
		callbacks = {
			update: (key: string, value: string) => {},
			enter: (value: string) => {}
		},
		options = this.#parent.defaultConfig.uikitTextbox
	) {
		element.addEventListener(
			"keydown",
			(event) => {
				const val = String(element.value);
				if (event.code == "Enter") {
					if (typeof callbacks.enter !== "function") return;

					callbacks.enter(val);
				} else {
					if (typeof callbacks.update !== "function") return;

					callbacks.update(event.key, val);
				}
			},
			{ signal: this.#signal }
		);
	}

	uikitTextarea(
		element: HTMLTextAreaElement,
		x: number = 0,
		y: number = 0,
		width: number = 100,
		height: number = 50,
		callbacks: any,
		options = this.#parent.defaultConfig.uikitTextarea
	) {
		element.addEventListener(
			"keydown",
			(event) => {
				console.log("a");
				const val = String(element.value);

				if (event.code == "Enter") {
					if (typeof callbacks.enter !== "function") return;

					callbacks.enter(val);
				} else {
					if (typeof callbacks.update !== "function") return;

					callbacks.update(event.key, val);
				}
			},
			{ signal: this.#signal }
		);
	}
}
