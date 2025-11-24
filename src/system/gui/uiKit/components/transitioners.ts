import { setElementStyle } from "../../html.js";
import { step } from "../definitions.js";

export default class uiKitTransitioners {
	textboxElem: HTMLInputElement | HTMLTextAreaElement | undefined;
	hasTextbox: boolean = false;

	uikitIcon(element: HTMLElement, oldStep: step, newStep: step): boolean {
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
					return false;
				default:
					throw new Error("Unknown key: " + i);
			}
		}

		return true;
	}

	uikitText(element: HTMLElement, oldStep: step, newStep: step): boolean {
		for (const i in newStep.args) {
			const oldArg = oldStep.args[i];
			const newArg = newStep.args[i];

			if (oldArg == newArg) continue;

			// x = 0, y = 0, string = "", fontSize: number, colour: string

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
					// string
					element.innerText = newArg;
					break;
				case 3:
					// fontSize
					setElementStyle(element, "fontSize", `${newArg}px`);
					break;
				case 4:
					// colour
					setElementStyle(element, "color", newArg);
					break;
				default:
					throw new Error("Unknown key: " + i);
			}
		}

		return true;
	}

	uikitBox(element: HTMLElement, oldStep: step, newStep: step): boolean {
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
					setElementStyle(
						element,
						"borderRadius",
						`${newArg?.borderRadius}px`
					);

					if (newArg?.isFrosted == true) {
						element.classList.add("frosted");
					} else {
						element.classList.remove("frosted");
					}

					if (newArg?.background == "sidebar") {
						setElementStyle(
							element,
							"background",
							"var(--headerColour)"
						);
					} else {
						setElementStyle(
							element,
							"background",
							`${newArg?.background || "var(--bg-light)"}`
						);
					}
					break;
				default:
					throw new Error("Unknown key: " + i);
			}
		}

		return true;
	}

	uikitEmbeddedTui(
		element: HTMLElement,
		oldStep: step,
		newStep: step
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
		oldStep: step,
		newStep: step
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
