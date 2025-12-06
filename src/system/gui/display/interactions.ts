import { GraphicalInterface } from "../gui.js";
import { snappingWindowInfo } from "./definitions.js";
import WindowSystem from "./windowSystem.js";

export default class WindowSystemInteractions {
	#parent: WindowSystem;
	#GraphicalInterface: GraphicalInterface;

	constructor(parent: WindowSystem, GraphicalInterface: GraphicalInterface) {
		this.#parent = parent;
		this.#GraphicalInterface = GraphicalInterface;
	}

	windowPointerDown(e: PointerEvent) {
		// clear target if clicking outside windows
		// target is assigned within the window's constructor.

		if (!this.#parent.target) return;
		e.preventDefault();
	}

	windowPointerMove(e: PointerEvent) {
		const parent = this.#parent;

		if (!parent.target) return;

		const x = e.clientX - parent.offsetX;
		const y = e.clientY - parent.offsetY;

		parent.target.windowX = x;
		parent.target.windowY = y;

		const win = parent.target.window;

		win.move(x, y);
		win.unfullscreen();

		let side: snappingWindowInfo["side"] | undefined = undefined;

		if (y < this.#parent.bounds.upper) {
			side = "fullscreen";
		} else if (x < this.#parent.bounds.left) {
			side = "left";
		} else if (
			x + win.dimensions.width >
			this.#GraphicalInterface.displayWidth - this.#parent.bounds.right
		) {
			side = "right";
		} else if (
			y + win.dimensions.height >
			this.#GraphicalInterface.displayHeight - this.#parent.bounds.lower
		) {
			side = "bottom";
		}

		if (side == undefined) {
			// no snapping needed
			if (parent.snappingWindow?.window == win) {
				parent.snappingWindow = undefined;
			}
			return;
		}

		parent.snappingWindow = {
			window: win,
			side
		};
	}

	windowPointerUp() {
		const parent = this.#parent;

		if (parent.snappingWindow !== undefined) {
			// we need to actually snap the window

			const scale = this.#GraphicalInterface.displayScaling;

			const leftBound =
				this.#GraphicalInterface.windowSystem.bounds.left / scale;
			const rightBound =
				this.#GraphicalInterface.windowSystem.bounds.right / scale;
			const topBound =
				this.#GraphicalInterface.windowSystem.bounds.upper / scale;
			const bottomBound =
				this.#GraphicalInterface.windowSystem.bounds.lower / scale;

			let x = 0;
			let y = 0;
			let width = 0;
			let height = 0;

			const win = parent.snappingWindow.window;
			switch (parent.snappingWindow.side) {
				case "left":
					x = leftBound;
					y = topBound;

					width =
						this.#GraphicalInterface.displayWidth / 2 - leftBound;
					height =
						this.#GraphicalInterface.displayHeight -
						(topBound + bottomBound);

					break;
				case "right":
					x = this.#GraphicalInterface.displayWidth / 2 - rightBound;
					y = topBound;

					width =
						this.#GraphicalInterface.displayWidth / 2 - rightBound;
					height =
						this.#GraphicalInterface.displayHeight -
						(topBound + bottomBound);

					break;
				case "fullscreen":
					x = leftBound;
					y = topBound;

					width =
						this.#GraphicalInterface.displayWidth -
						(leftBound + rightBound);
					height =
						this.#GraphicalInterface.displayHeight -
						(topBound + bottomBound);
					break;
				case "top":
					x = leftBound;
					y = topBound;

					width =
						this.#GraphicalInterface.displayWidth -
						(leftBound + rightBound);
					height =
						this.#GraphicalInterface.displayHeight / 2 -
						(topBound + bottomBound);
					break;

				case "bottom":
					x = leftBound;
					y = this.#GraphicalInterface.displayHeight / 2;

					width =
						this.#GraphicalInterface.displayWidth -
						(leftBound + rightBound);
					height =
						this.#GraphicalInterface.displayHeight / 2 -
						bottomBound;
					break;

				default:
					throw new Error(
						`Undefined snapping side: ${parent.snappingWindow.side}`
					);
			}

			win.move(x, y);
			win.resize(width, height, true);

			parent.snappingWindow = undefined;
		}

		parent.target = undefined;
	}

	windowResize() {
		this.#parent.updateWindows();
	}

	documentTouchMove(e: TouchEvent) {
		e.preventDefault();
	}

	keydown(e: KeyboardEvent) {
		if (!e.altKey) return;

		switch (e.code) {
			/* -------------------- Window Snapping -------------------- */
			case "ArrowLeft": {
				const window = this.#parent.getWindowOfId(
					this.#parent.focusedWindow
				);

				if (!window) return;

				this.#parent.snappingWindow = {
					side: "left",
					window
				};

				this.windowPointerUp();

				break;
			}
			case "ArrowRight": {
				const window = this.#parent.getWindowOfId(
					this.#parent.focusedWindow
				);

				if (!window) return;

				if (this.#parent.snappingWindow) {
					window.move(undefined, undefined, true);
				} else {
					this.#parent.snappingWindow = {
						side: "right",
						window
					};

					this.windowPointerUp();
				}

				break;
			}
			case "ArrowUp": {
				const window = this.#parent.getWindowOfId(
					this.#parent.focusedWindow
				);

				if (!window) return;

				this.#parent.snappingWindow = {
					side: "top",
					window
				};

				this.windowPointerUp();

				break;
			}
			case "ArrowDown": {
				const window = this.#parent.getWindowOfId(
					this.#parent.focusedWindow
				);

				if (!window) return;

				this.#parent.snappingWindow = {
					side: "bottom",
					window
				};

				this.windowPointerUp();

				break;
			}
			case "Enter": {
				const window = this.#parent.getWindowOfId(
					this.#parent.focusedWindow
				);

				if (!window) return;

				this.#parent.snappingWindow = {
					side: "fullscreen",
					window
				};

				this.windowPointerUp();

				break;
			}
		}
	}

	async terminate() {}
}
