import { GraphicalWindow } from "../../display/windowTypes.js";
import { setElementProperty, setElementStyle } from "../../html.js";
import { ConfigStep, uikitTextareaConfig } from "../definitions.js";

export default class UiKitTransitioners {
	textboxElem: HTMLInputElement | HTMLTextAreaElement | undefined;
	hasTextbox: boolean = false;
	#window?: GraphicalWindow;

	constructor(window?: GraphicalWindow) {
		this.#window = window;
	}

	uikitText = (
		element: HTMLElement,
		oldStep: ConfigStep,
		newStep: ConfigStep
	): boolean => {
		for (const i in newStep.args) {
			const oldArg = oldStep.args[i];
			const newArg = newStep.args[i];

			if (oldArg == newArg) continue;

			// x = 0, y = 0, name = "circle-help", scale = 1, colour: string

			switch (Number(i)) {
				case 0:
					// X position
					setElementStyle(element, "left", `${newArg}px`);
					break;
				case 1:
					// Y position
					setElementStyle(element, "top", `${newArg}px`);
					break;
				case 2:
					// contents
					setElementProperty(element, "innerText", newArg);
					break;
				case 3:
					// fontSize
					setElementStyle(element, "fontSize", `${newArg}px`);
					break;
				case 4:
					// colour
					setElementStyle(element, "color", newArg);
					break;
				case 5:
					// font
					setElementStyle(element, "fontFamily", newArg ?? "");
					return false;
				default:
					throw new Error("Unknown key: " + i);
			}
		}

		return true;
	};

	uikitIcon(
		element: HTMLElement,
		oldStep: ConfigStep,
		newStep: ConfigStep
	): boolean {
		for (const i in newStep.args) {
			const oldArg = oldStep.args[i];
			const newArg = newStep.args[i];

			if (oldArg == newArg) continue;

			// x = 0, y = 0, name = "circle-help", scale = 1, colour: string

			switch (Number(i)) {
				case 0:
					// X position
					setElementStyle(element, "left", `${newArg}px`);
					break;
				case 1:
					// Y position
					setElementStyle(element, "top", `${newArg}px`);
					break;
				case 2:
					// name
					// not easily changable from here
					return false; // indicate to commit that it's better to just recreate the element, let's be real.
				case 3:
					// scale
					setElementStyle(element, "width", `${newArg * 24}px`);
					setElementStyle(element, "height", `${newArg * 24}px`);
					break;
				case 4:
					// colour
					setElementStyle(element, "color", newArg);
					break;
				case 5:
					// options

					setElementStyle(
						element,
						"borderRadius",
						newArg?.borderRadius ?? 0
					);
					return false;
				default:
					throw new Error("Unknown key: " + i);
			}
		}

		return true;
	}

	uikitImage(
		element: HTMLElement,
		oldStep: ConfigStep,
		newStep: ConfigStep
	): boolean {
		for (const i in newStep.args) {
			const oldArg = oldStep.args[i];
			const newArg = newStep.args[i];

			if (oldArg == newArg) continue;

			// x = 0, y = 0, name = "circle-help", scale = 1, colour: string

			switch (Number(i)) {
				case 0:
					// X position
					setElementStyle(element, "left", `${newArg}px`);
					break;
				case 1:
					// Y position
					setElementStyle(element, "top", `${newArg}px`);
					break;
				case 2:
					// location
					// not easily changable from here
					return false; // indicate to commit that it's better to just recreate the element, let's be real.
				case 3:
					// width
					setElementStyle(element, "width", `${newArg}px`);
					break;
				case 4:
					// height
					setElementStyle(element, "height", `${newArg}px`);
					break;
				case 5:
					// options

					setElementStyle(
						element,
						"borderRadius",
						newArg?.borderRadius ?? 0
					);
					return false;
				default:
					throw new Error("Unknown key: " + i);
			}
		}

		return true;
	}

	uikitBox = (
		element: HTMLElement,
		oldStep: ConfigStep,
		newStep: ConfigStep
	): boolean => {
		for (const i in newStep.args) {
			const oldArg = oldStep.args[i];
			const newArg = newStep.args[i];

			if (oldArg == newArg) continue;

			switch (Number(i)) {
				case 0:
					// X position
					setElementStyle(element, "left", `${newArg}px`);
					break;
				case 1:
					// Y position
					setElementStyle(element, "top", `${newArg}px`);
					break;
				case 2:
					// width
					setElementStyle(element, "width", `${newArg}px`);
					break;
				case 3:
					// height
					setElementStyle(element, "height", `${newArg}px`);
					break;
				case 4:
					// config
					const borderRadius = newArg?.borderRadius;
					if (borderRadius) {
						if (borderRadius instanceof Array) {
							setElementStyle(
								element,
								"borderRadius",
								`${borderRadius.join("px ")}px`
							);
						} else {
							setElementStyle(
								element,
								"borderRadius",
								`${borderRadius}px`
							);
						}
					}

					if (newArg?.background == "panel") {
						if (
							this.#window?.container.classList.contains(
								"frosted"
							)
						) {
							setElementStyle(element, "background", "");
							setElementStyle(element, "backdropFilter", "");
							element.classList.add("glass");
						} else {
							setElementStyle(
								element,
								"background",
								"var(--panelColour)"
							);
							setElementStyle(
								element,
								"backdropFilter",
								"blur(var(--headerBlur))"
							);
						}
					} else {
						setElementStyle(
							element,
							"background",
							`${newArg?.background ?? "var(--bg-light)"}`
						);
						setElementStyle(element, "backdropFilter", "");
					}

					if (newArg?.isFrosted == true) {
						element.classList.add("frosted");
					} else {
						element.classList.remove("frosted");
					}

					break;
				default:
					throw new Error("Unknown key: " + i);
			}
		}

		return true;
	};

	uikitTextbox = (
		element: HTMLElement,
		oldStep: ConfigStep,
		newStep: ConfigStep
	): boolean => {
		for (const i in newStep.args) {
			const oldArg = oldStep.args[i];
			const newArg = newStep.args[i];

			if (oldArg == newArg) continue;

			switch (Number(i)) {
				case 0:
					// X position
					setElementStyle(element, "left", `${newArg}px`);
					break;
				case 1:
					// Y position
					setElementStyle(element, "top", `${newArg}px`);
					break;
				case 2:
					// width
					setElementStyle(element, "width", `${newArg}px`);
					break;
				case 3:
					// height
					setElementStyle(element, "height", `${newArg}px`);
					break;
				case 4:
					// callbacks
					// don't care

					break;
				case 5:
					// options

					if (oldArg !== newArg) return false;

					break;
				default:
					throw new Error("Unknown key: " + i);
			}
		}

		return true;
	};

	uikitTextarea = (
		element: HTMLElement,
		oldStep: ConfigStep,
		newStep: ConfigStep
	): boolean => {
		for (const i in newStep.args) {
			const oldArg = oldStep.args[i];
			const newArg = newStep.args[i];

			if (oldArg == newArg) continue;

			switch (Number(i)) {
				case 0:
					// X position
					setElementStyle(element, "left", `${newArg}px`);
					break;
				case 1:
					// Y position
					setElementStyle(element, "top", `${newArg}px`);
					break;
				case 2:
					// width
					setElementStyle(element, "width", `${newArg}px`);
					break;
				case 3:
					// height
					setElementStyle(element, "height", `${newArg}px`);
					break;
				case 4:
					// callbacks
					// don't care

					break;
				case 5:
					// options
					const old: uikitTextareaConfig = oldArg;
					const newer: uikitTextareaConfig = newArg;

					if (
						old.disableMobileAutocorrect !==
						newer.disableMobileAutocorrect
					)
						return false;
					if (old.font !== newer.font) return false;
					if (old.isEmpty !== newer.isEmpty) return false;
					if (old.isInvisible !== newer.isInvisible) return false;

					break;
				default:
					throw new Error("Unknown key: " + i);
			}
		}

		return true;
	};

	uikitProgressBar = (
		element: HTMLElement,
		oldStep: ConfigStep,
		newStep: ConfigStep
	): boolean => {
		for (const i in newStep.args) {
			const oldArg = oldStep.args[i];
			const newArg = newStep.args[i];

			if (oldArg == newArg) continue;

			switch (Number(i)) {
				case 0:
					// X position
					setElementStyle(element, "left", `${newArg}px`);
					break;

				case 1:
					// Y position
					setElementStyle(element, "top", `${newArg}px`);
					break;

				case 2:
					// width
					setElementStyle(element, "width", `${newArg}px`);
					break;

				case 3:
					// height
					setElementStyle(element, "height", `${newArg}px`);
					break;

				case 4:
					// progress
					const progressBar = element.childNodes[0];

					// @ts-expect-error
					progressBar.style.width = `${newArg}%`;
					break;

				case 5:
					// onDrag is fine
					break;

				case 6:
					// colour
					setElementStyle(element, "background", newArg);

					if (newArg == "panel") {
						if (
							this.#window?.container.classList.contains(
								"frosted"
							)
						) {
							setElementStyle(element, "background", "");
							setElementStyle(element, "backdropFilter", "");
							element.classList.add("glass");
						} else {
							setElementStyle(
								element,
								"background",
								"var(--panelColour)"
							);
							setElementStyle(
								element,
								"backdropFilter",
								"blur(var(--headerBlur))"
							);
						}
					} else {
						setElementStyle(
							element,
							"background",
							`${newArg ?? "var(--bg-light)"}`
						);
						setElementStyle(element, "backdropFilter", "");
					}

					break;

				default:
					throw new Error("Unknown key: " + i);
			}
		}

		return true;
	};

	uikitEmbeddedTui(
		element: HTMLElement,
		oldStep: ConfigStep,
		newStep: ConfigStep
	): boolean {
		for (const i in newStep.args) {
			const oldArg = oldStep.args[i];
			const newArg = newStep.args[i];

			if (oldArg == newArg) continue;

			switch (Number(i)) {
				case 0:
					// X position
					setElementStyle(element, "left", `${newArg}px`);
					break;
				case 1:
					// Y position
					setElementStyle(element, "top", `${newArg}px`);
					break;
				case 2:
					// width
					setElementStyle(element, "width", `${newArg}px`);
				case 3:
					// height
					setElementStyle(element, "height", `${newArg}px`);
					break;
				default:
					throw new Error("Unknown key: " + i);
			}
		}

		return true;
	}

	uikitIframe(
		element: HTMLIFrameElement,
		oldStep: ConfigStep,
		newStep: ConfigStep
	): boolean {
		for (const i in newStep.args) {
			const oldArg = oldStep.args[i];
			const newArg = newStep.args[i];

			if (oldArg == newArg) continue;

			switch (Number(i)) {
				case 0:
					// X position
					setElementStyle(element, "left", `${newArg}px`);
					break;
				case 1:
					// Y position
					setElementStyle(element, "top", `${newArg}px`);
					break;
				case 2:
					// width
					setElementStyle(element, "width", `${newArg}px`);
				case 3:
					// height
					setElementStyle(element, "height", `${newArg}px`);
					break;
				case 4:
					// URL
					element.src = newArg;
					break;
				case 5:
					// onMessage
					break;
				default:
					throw new Error("Unknown key: " + i);
			}
		}

		return true;
	}
}
