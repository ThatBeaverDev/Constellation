import { GraphicalWindow } from "../../display/windowTypes.js";
import { GraphicalInterface } from "../../gui.js";
import { defaultConfig } from "./defaultConfig.js";
import { textboxCallbackObject } from "/System/gui/uiKit/definitions.js";

export default class UIKitEventListeners {
	#signal: AbortSignal;
	#gui: GraphicalInterface;
	#window: GraphicalWindow;
	setSignal(signal: AbortSignal) {
		this.#signal = signal;
	}

	constructor(
		GraphicalInterface: GraphicalInterface,
		signal: AbortSignal,
		window: GraphicalWindow
	) {
		this.#gui = GraphicalInterface;
		this.#signal = signal;
		this.#window = window;
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
		callbacks: textboxCallbackObject,
		options = defaultConfig.uikitTextbox
	) {
		element.addEventListener(
			"keydown",
			(event) => {
				const val = String(element.value);

				if (event.code == "Enter") {
					if (typeof callbacks.enter == "function")
						callbacks.enter(val);
				} else {
					if (typeof callbacks.beforeUpdate == "function")
						callbacks.beforeUpdate(event.key, val);

					if (typeof callbacks.afterUpdate == "function") {
						setTimeout(() => {
							if (typeof callbacks.afterUpdate == "function") {
								callbacks.afterUpdate(event.key, val);
							}
						}, 0);
					}
				}
			},
			{ signal: this.#signal }
		);
	}

	uikitProgressBar(
		element: HTMLDivElement,
		x: number,
		y: number,
		width: number,
		height: number,
		progress: number | "throb",
		onDrag: (progress: number) => Promise<void> | void
	) {
		if (!onDrag) return;
		if (!element.dataset.isDragging) element.dataset.isDragging = "false";

		element.addEventListener(
			"pointerdown",
			(e) => {
				element.dataset.isDragging = "true";

				moveProgress(e);
			},
			{ signal: this.#signal }
		);

		const moveProgress = (e: PointerEvent) => {
			if (element.dataset.isDragging !== "true") return;

			function clamp(n: number, min: number, max: number) {
				if (n < min) return min;
				if (n > max) return max;

				return n;
			}

			const mouseX = e.clientX - this.#window.position.left;
			const progressX = clamp(mouseX - x, 0, width);

			const newProgress = (progressX / width) * 100;

			onDrag(newProgress);
		};

		this.#gui.container.addEventListener("pointermove", moveProgress, {
			signal: this.#signal
		});

		// pointerup is in the creator script since it's constant
	}

	uikitTextarea(
		element: HTMLTextAreaElement,
		x: number = 0,
		y: number = 0,
		width: number = 100,
		height: number = 50,
		callbacks: textboxCallbackObject,
		options = defaultConfig.uikitTextarea
	) {
		element.addEventListener(
			"keydown",
			(event) => {
				const val = String(element.value);

				if (event.code == "Enter") {
					if (typeof callbacks.enter == "function")
						callbacks.enter(val);
				} else {
					if (typeof callbacks.beforeUpdate == "function")
						callbacks.beforeUpdate(event.key, val);

					if (typeof callbacks.afterUpdate == "function") {
						setTimeout(() => {
							if (typeof callbacks.afterUpdate == "function") {
								callbacks.afterUpdate(event.key, val);
							}
						}, 0);
					}
				}
			},
			{ signal: this.#signal }
		);
	}

	uikitIframe(
		element: HTMLIFrameElement,
		x: number,
		y: number,
		width: number,
		height: number,
		url: string,
		onMessage: (data: any) => Promise<void> | void
	) {
		window.addEventListener(
			"message",
			(event) => {
				if (event.source == element.contentWindow) {
					onMessage(event.data);
				}
			},
			{
				signal: this.#signal
			}
		);
	}
}
