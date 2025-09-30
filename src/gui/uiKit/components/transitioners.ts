import { step } from "../definitions.js";

export default class uiKitTransitioners {
	textboxElem: HTMLInputElement | HTMLTextAreaElement | undefined;
	hasTextbox: boolean = false;

	readonly uikitIcon = (
		icon: HTMLElement,
		oldStep: step,
		newStep: step
	): boolean => {
		for (const i in newStep.args) {
			const oldArg = oldStep.args[i];
			const newArg = newStep.args[i];

			if (oldArg == newArg) continue;

			// x = 0, y = 0, name = "circle-help", scale = 1, colour: string

			switch (Number(i)) {
				case 0:
					// X position
					icon.style.left = `${newArg}px`;
					break;
				case 1:
					// Y position
					icon.style.top = `${newArg}px`;
					break;
				case 2:
					// name
					// not easily changable from here
					return false; // indicate to commit that it's better to just recreate the element, let's be real.
				case 3:
					// scale
					icon.style.width = `${newArg * 24}px`;
					icon.style.height = `${newArg * 24}px`;
					break;
				case 4:
					// colour
					icon.style.color = newArg;
					break;
				case 5:
					// options
					return false;
				default:
					throw new Error("Unknown key: " + i);
			}
		}

		return true;
	};

	readonly uikitText = (
		text: HTMLElement,
		oldStep: step,
		newStep: step
	): boolean => {
		for (const i in newStep.args) {
			const oldArg = oldStep.args[i];
			const newArg = newStep.args[i];

			if (oldArg == newArg) continue;

			// x = 0, y = 0, string = "", fontSize: number, colour: string

			switch (Number(i)) {
				case 0:
					// X position
					text.style.left = `${newArg}px`;
					break;
				case 1:
					// Y position
					text.style.top = `${newArg}px`;
					break;
				case 2:
					// string
					text.innerText = newArg;
					break;
				case 3:
					// fontSize
					text.style.fontSize = `${newArg}px`;
					break;
				case 4:
					// colour
					text.style.color = newArg;
					break;
				default:
					throw new Error("Unknown key: " + i);
			}
		}

		return true;
	};

	readonly uikitBox = (
		box: HTMLElement,
		oldStep: step,
		newStep: step
	): boolean => {
		for (const i in newStep.args) {
			const oldArg = oldStep.args[i];
			const newArg = newStep.args[i];

			if (oldArg == newArg) continue;

			switch (Number(i)) {
				case 0:
					// X position
					box.style.left = `${newArg}px`;
					break;
				case 1:
					// Y position
					box.style.top = `${newArg}px`;
					break;
				case 2:
					// width
					box.style.width = `${newArg}px`;
					break;
				case 3:
					// height
					box.style.height = `${newArg}px`;
					break;
				case 4:
					// config
					box.style.borderRadius = `${newArg?.borderRadius}px`;

					if (newArg?.isFrosted == true) {
						box.classList.add("frosted");
					} else {
						box.classList.remove("frosted");
					}

					if (newArg?.background == "sidebar") {
						box.style.background = `var(--headerColour)`;
					} else {
						box.style.background = `${newArg?.background || "var(--main-theme-tertiary)"}`;
					}
					break;
				default:
					throw new Error("Unknown key: " + i);
			}
		}

		return true;
	};
}
