import { GuiApplication } from "../../runtime/components/executables.js";
import ConstellationKernel, { Terminatable } from "../../kernel.js";
import cssVariables from "./css.js";
import { showUserPrompt } from "../prompt.js";
import WindowSystemInteractions from "./interactions.js";
import { GraphicalInterface } from "../gui.js";
import { GraphicalWindow } from "./windowTypes.js";
import { snappingWindowInfo, UserPromptConfig } from "./definitions.js";
import { OverlayWindow } from "./windowTypes.js";
import { UnderlayWindow } from "./windowTypes.js";

const path = "/System/gui/display/windowSystem.js";

export default class WindowSystem {
	windows: GraphicalWindow[] = [];
	windowTypes = { GraphicalWindow, OverlayWindow, UnderlayWindow };
	allWindows() {
		return this.windows;
	}

	// variables
	minimiseAnimation = "flick";
	/**
	 * ID of the currently focused window
	 */
	focusedWindow: number | undefined;
	target:
		| {
				window: GraphicalWindow;

				originX: number;
				originY: number;

				windowX: number;
				windowY: number;

				hasMoved: boolean;
		  }
		| undefined = undefined;
	startMouseX = 0;
	startMouseY = 0;
	offsetX = 0;
	offsetY = 0;

	winID = 0;
	windowTilingNumber = 0;
	#ConstellationKernel: ConstellationKernel;
	cssVariables: cssVariables & Terminatable;
	interactions: WindowSystemInteractions & Terminatable;

	bounds: { upper: number; left: number; right: number; lower: number } = {
		upper: 0,
		left: 0,
		right: 0,
		lower: 0
	};

	_snappingWindow: snappingWindowInfo | undefined;
	_snappingWindowDisplay: HTMLDivElement;
	set snappingWindow(info: snappingWindowInfo | undefined) {
		// make it snap

		if (info == undefined) {
			// no more snapping

			this._snappingWindowDisplay.classList.remove("snapRight");
			this._snappingWindowDisplay.classList.remove("snapLeft");
			this._snappingWindowDisplay.classList.remove("snapFullscreen");

			this._snappingWindow = undefined;

			return;
		}

		this._snappingWindowDisplay.style.zIndex =
			this._snappingWindow?.window.container.style.zIndex || "Infinity";

		if (
			this._snappingWindow?.window === info.window &&
			this._snappingWindow.side == info.side
		) {
			return;
		}

		switch (info.side) {
			case "left":
				this._snappingWindowDisplay.classList.remove("snapRight");
				this._snappingWindowDisplay.classList.remove("snapFullscreen");
				this._snappingWindowDisplay.classList.add("snapLeft");

				break;
			case "right":
				this._snappingWindowDisplay.classList.remove("snapLeft");
				this._snappingWindowDisplay.classList.remove("snapFullscreen");
				this._snappingWindowDisplay.classList.add("snapRight");

				break;
			case "fullscreen":
				this._snappingWindowDisplay.classList.remove("snapLeft");
				this._snappingWindowDisplay.classList.remove("snapRight");
				this._snappingWindowDisplay.classList.add("snapFullscreen");
				break;
		}

		this._snappingWindow = info;
	}

	get snappingWindow(): snappingWindowInfo | undefined {
		return this._snappingWindow;
	}

	update: ReturnType<typeof setInterval>;

	constructor(
		ConstellationKernel: ConstellationKernel,
		GraphicalInterface: GraphicalInterface
	) {
		this.#ConstellationKernel = ConstellationKernel;

		// window snapping
		const elem = document.createElement("div");
		elem.id = String(window.renderID++);
		elem.classList.add("windowSnappingIndicator");
		elem.classList.add("frosted");

		GraphicalInterface.container.appendChild(elem);

		this._snappingWindowDisplay = elem;

		// init css styles
		this.cssVariables = new cssVariables(
			ConstellationKernel,
			GraphicalInterface
		);
		this.cssVariables.applyWindowCSS();
		this.setCSSVariable = this.cssVariables.setCSSVariable.bind(
			this.cssVariables
		);

		// init interactions
		this.interactions = new WindowSystemInteractions(
			this,
			GraphicalInterface
		);

		// event listeners
		window.addEventListener(
			"pointerdown",
			this.interactions.windowPointerDown.bind(this.interactions)
		);

		window.addEventListener(
			"pointermove",
			this.interactions.windowPointerMove.bind(this.interactions)
		);

		// stop the dragging
		window.addEventListener(
			"pointerup",
			this.interactions.windowPointerUp.bind(this.interactions)
		);

		window.addEventListener(
			"resize",
			this.interactions.windowResize.bind(this.interactions)
		);

		document.addEventListener(
			"touchmove",
			this.interactions.documentTouchMove.bind(this.interactions),
			{ passive: false }
		);

		this.styleElem = document.createElement("style");
		this.styleElem.id = String(window.renderID++);
		this.styleElem.className = "windowsAnimationStyles";

		GraphicalInterface.container.appendChild(this.styleElem);

		this.update = setInterval(() => {
			if (this.minimiseAnimation !== this.oldMinimiseAnimation) {
				this.oldMinimiseAnimation = String(this.minimiseAnimation);
				this.updateLiveStyling();
			}
		});
	}

	relayer() {
		const layers = this.windows.map((item) => item.layer);
		const minLayer = Math.min(...layers);
		const maxLayer = Math.max(...layers);

		let currentLayer = Number(minLayer);

		let zIndex = 10;
		while (currentLayer <= maxLayer) {
			this.windows
				// windows on the current layer
				.filter((window) => window.layer == currentLayer)
				// get layered by index. last in the array is the highest layer.
				.forEach((window) => {
					window.container.style.zIndex = String(zIndex);
					zIndex += 10;
				});
			currentLayer++;
		}
	}

	async terminate() {
		this._snappingWindowDisplay.remove();

		// submodules
		await this.cssVariables.terminate();
		await this.interactions.terminate();

		// event listeners
		window.removeEventListener(
			"pointerdown",
			this.interactions.windowPointerDown
		);
		window.removeEventListener(
			"pointermove",
			this.interactions.windowPointerMove
		);
		window.removeEventListener(
			"pointerup",
			this.interactions.windowPointerUp
		);
		window.removeEventListener("resize", this.interactions.windowResize);
		document.removeEventListener(
			"touchmove",
			this.interactions.documentTouchMove
		);

		// close windows
		this.windows.forEach((window) => window.remove());

		this.styleElem.remove();
		clearInterval(this.update);
	}

	setCSSVariable: (key: string, value: string) => void;

	maxWinID = 0;

	/**
	 * Returns the window of the given ID, **or the focused window if unspecified.**
	 * @param id - the ID to search for
	 * @returns Window by the requested ID if found, else undefined.
	 */
	getWindowOfId(id: number | undefined = this.focusedWindow) {
		for (const window of this.windows) {
			if (window.winID == id) {
				return window;
			}
		}
	}

	focusWindow(id: number) {
		const gui = this.#ConstellationKernel.ui;
		if (gui.type !== "GraphicalInterface")
			throw new Error("GUI is required.");

		const target = this.getWindowOfId(id);

		if (target == undefined) {
			// that window doesn't exist!
			return undefined;
		}

		const supposedlyFocusedWindows =
			gui.shadowRoot.querySelectorAll(".focused");

		// remove focus from all windows
		for (const elem of supposedlyFocusedWindows) {
			elem.classList.remove("focused");
		}

		// focus our window
		this.focusedWindow = id;
		target.container.classList.add("focused");

		// move target to the end of the windows list so it gets layered ontop
		const targetIndex = this.windows.indexOf(target);
		this.windows.splice(targetIndex, 1);
		this.windows.push(target);
	}

	setMinimiseEffect(effect: string) {
		this.minimiseAnimation = String(effect);
	}

	updateWindows() {
		// get amount of windows which are visible.
		let totalWindows = 0;
		for (const win of this.windows) {
			if (win.visible) {
				totalWindows++;
			}
		}

		this.windows.forEach((win, index) => {
			win.container.style.resize = "both";

			win.reposition();
		});
	}

	newWindow(title: string, ApplicationObject?: GuiApplication) {
		const win = new GraphicalWindow(
			this.#ConstellationKernel,
			title,
			ApplicationObject
		);

		this.focusWindow(win.winID);

		this.updateWindows();

		return {
			id: win.winID,
			data: win
		};
	}

	oldMinimiseAnimation: string | undefined = undefined; // undefined so that we definitely initialise the mode we are in.

	reapplyStyles() {
		this.oldMinimiseAnimation = undefined;
	}

	styleElem: HTMLStyleElement;

	async updateLiveStyling() {
		this.#ConstellationKernel.lib.logging.debug(
			path,
			"Loading windowing CSS for minimise animation: " +
				this.minimiseAnimation
		);

		const css = await this.#ConstellationKernel.fs.readFile(
			"/System/gui/display/css/" + this.minimiseAnimation + ".css"
		);

		if (css == undefined) {
			return;
		}

		this.#ConstellationKernel.lib.logging.debug(
			path,
			"CSS retrieved successfully for minimise animation: " +
				this.minimiseAnimation
		);

		this.styleElem.textContent = css;
	}

	/**
	 * Displays a prompt to the user, providing a title, description and two options for buttons.
	 * @param icon - Icon to display at the top of the popup
	 * @param config - Configuration object to define properties of the popup
	 * @returns "primary" or "secondary", depending on whether the first or second button is pressed.
	 */
	async showUserPrompt(
		icon: string,
		config: UserPromptConfig
	): Promise<"primary" | "secondary" | never> {
		return await showUserPrompt(
			this.#ConstellationKernel,
			icon,
			"statement",
			config
		);
	}

	async askUserQuestion(
		icon: string,
		config: { title: string; subtext: string; defaultAnswer?: string }
	) {
		return await showUserPrompt(
			this.#ConstellationKernel,
			icon,
			"question",
			config
		);
	}
}
