import { GraphicalInterface } from "../gui.js";
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

		if (parent.target.hasMoved) {
			win.move(x, y);
			win.unfullscreen();

			let side: "left" | "right" | "fullscreen" | undefined = undefined;

			if (x < this.#parent.bounds.left) {
				side = "left";
			} else if (
				x + win.dimensions.width >
				this.#GraphicalInterface.displayWidth -
					this.#parent.bounds.right
			) {
				side = "right";
			} else if (y < this.#parent.bounds.upper) {
				side = "fullscreen";
			}

			// no snapping needed
			if (side == undefined) {
				if (parent.snappingWindow?.window == win) {
					parent.snappingWindow = undefined;
				}
				return;
			}

			parent.snappingWindow = {
				window: win,
				side
			};
		} else {
			const distanceX = Math.abs(
				parent.target.windowX - parent.target.originX
			);
			const distanceY = Math.abs(
				parent.target.windowY - parent.target.originY
			);
			const distancePythagoras = Math.sqrt(
				distanceX ** 2 + distanceY ** 2
			);

			if (distancePythagoras > 10) {
				parent.target.hasMoved = true;
			}
		}
	}

	windowPointerUp(e: PointerEvent) {
		const parent = this.#parent;

		if (parent.snappingWindow !== undefined) {
			// we need to actually snap the window

			const leftBound = this.#GraphicalInterface.windowSystem.bounds.left;
			const rightBound =
				this.#GraphicalInterface.windowSystem.bounds.right;
			const topBound = this.#GraphicalInterface.windowSystem.bounds.upper;
			const bottomBound =
				this.#GraphicalInterface.windowSystem.bounds.lower;

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

	async terminate() {}
}
