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
			//setTimeout(() => {
			win.move(x, y);
			win.unfullscreen();

			let side: "left" | "right" | "fullscreen" | undefined = undefined;

			//if (snappingInfo.snapLeft) {
			//	side = "left";
			//} else if (snappingInfo.snapRight) {
			//	side = "right";
			//} else if (snappingInfo.snapFullscreen) {
			//	side = "fullscreen";
			//}
			if (x < 0) {
				side = "left";
			} else if (
				x + win.dimensions.width >
				this.#GraphicalInterface.displayWidth
			) {
				side = "right";
			} else if (y < 0) {
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
			//}, 10);
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

			const win = parent.snappingWindow.window;
			switch (parent.snappingWindow.side) {
				case "left":
					win.move(0, 0);
					win.resize(
						this.#GraphicalInterface.displayWidth / 2,
						this.#GraphicalInterface.displayHeight,
						true
					);
					break;
				case "right":
					win.move(this.#GraphicalInterface.displayWidth / 2, 0);
					win.resize(
						this.#GraphicalInterface.displayWidth / 2,
						this.#GraphicalInterface.displayHeight,
						true
					);
					break;
				case "fullscreen":
					win.move(0, 0);
					win.resize(
						this.#GraphicalInterface.displayWidth,
						this.#GraphicalInterface.displayHeight,
						true
					);
			}

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
