import ConstellationKernel from "../../../kernel.js";
import { getTextWidth } from "./textUtils.js";

const padding = 10;

export class ContextMenu {
	#start = Date.now();

	constructor(
		ConstellationKernel: ConstellationKernel,
		x: number,
		y: number,
		headerText: string,
		items: Record<string, Function>
	) {
		if (!ConstellationKernel.GraphicalInterface)
			throw new Error("Graphical system is required!");

		let maxWidth = 0;
		for (const i of [headerText, ...Object.keys(items)]) {
			const width = getTextWidth(i);

			if (width > maxWidth) {
				maxWidth = width;
			}
		}

		let height = 0;
		height += padding; // header
		height += 5; // divider
		height += Object.keys(items).length * (padding * 2 + 5); // items, 2 padding each and 5px.

		if (y + height > ConstellationKernel.GraphicalInterface.displayHeight) {
			// need to show ABOVE the mouse
			y -= height;
		}

		this.container = document.createElement("div");
		this.container.className = "uikitContextContainer";
		this.container.id = "context" + String(window.renderID++);
		this.container.style.left = `${x}px`;
		this.container.style.top = `${y}px`;
		this.container.style.width = `${maxWidth}px`;
		this.container.style.height = `${height}px`;

		this.header = document.createElement("p");
		this.header.id = "context" + String(window.renderID++);
		this.header.className = "uikitText";
		this.header.innerText = headerText;

		let yPos = padding * 2 + 5;

		yPos += 5;
		this.divider = document.createElement("div");
		this.divider.id = "context" + String(window.renderID++);
		this.divider.className = "uikitHorizontalLine";
		this.divider.style.left = `${padding}px`;
		this.divider.style.top = `${yPos}px`;
		this.divider.style.width = `${maxWidth}px`;
		yPos += 5;

		const widthOfSpace = getTextWidth(" ");

		this.items = Object.keys(items).map((text: string, index: number) => {
			const elem = document.createElement("button");
			elem.className = "uikitButton noBackground";
			elem.id = "context" + String(window.renderID++);

			elem.style.top = `${yPos}px`;
			elem.style.left = `${padding}px`;

			elem.style.width = `${maxWidth}px`;
			elem.style.height = `20px`;
			elem.style.textAlign = "left";

			const iconName = text.textBefore("-:-");
			const afterIcon = text.textAfter("-:-");

			let icon;
			let txt = text;

			if (afterIcon !== "") {
				txt = " ".repeat(Math.ceil(24 / widthOfSpace)) + afterIcon;

				if (ConstellationKernel.GraphicalInterface == undefined) {
					icon = document.createElement("img");
				} else {
					icon =
						ConstellationKernel.GraphicalInterface.getIcon(
							iconName
						);
				}

				icon.style.top = `${yPos}px`;
				icon.style.left = `${padding}px`;

				icon.style.width = "20px";
				icon.style.height = "20px";
				icon.style.pointerEvents = "none";
			}

			const beforeSemicolon = txt.textBeforeLast(";");
			if (beforeSemicolon !== "") {
				txt = beforeSemicolon;
			}

			elem.innerText = txt;
			elem.dataset.index = String(index);

			yPos += padding * 2 + 5;

			return { text: elem, icon };
		});

		ConstellationKernel.GraphicalInterface.container.appendChild(
			this.container
		);
		this.container =
			ConstellationKernel.GraphicalInterface.container.querySelector(
				"div#" + this.container.id
			)!;

		this.container.appendChild(this.header);
		this.header =
			ConstellationKernel.GraphicalInterface.container.querySelector(
				"p#" + this.header.id
			)!;

		this.container.appendChild(this.divider);
		this.divider =
			ConstellationKernel.GraphicalInterface.container.querySelector(
				"div#" + this.divider.id
			)!;

		for (const i in this.items) {
			const elems: { text: HTMLButtonElement; icon?: HTMLImageElement } =
				this.items[i];

			this.container.appendChild(elems.text);
			if (elems.icon !== undefined)
				this.container.appendChild(elems.icon);

			this.items[i].text.addEventListener(
				"pointerup",
				() => {
					const age = Date.now() - this.#start;
					if (age < 500) return;

					this.remove();

					const index = Number(this.items[i].text.dataset.index);
					const text = Object.keys(items)[index];
					const callback = items[text];

					callback();
				},
				{
					signal: this.#signal
				}
			);
		}

		const pointerup = (e: PointerEvent) => {
			const age = Date.now() - this.#start;
			if (age < 500) return;

			this.remove();
			e.stopImmediatePropagation();

			document.removeEventListener("pointerup", pointerup);
		};

		document.addEventListener("pointerup", pointerup);
	}

	container: HTMLDivElement;
	divider: HTMLDivElement;
	header: HTMLParagraphElement;
	items: { text: HTMLButtonElement; icon?: HTMLImageElement }[];

	// add abort controller to remove event listeners
	#controller = new AbortController();
	#signal = this.#controller.signal;

	readonly remove = () => {
		this.#controller.abort();

		this.header.remove();
		for (const i in this.items) {
			this.items[i].text.remove();
			if (this.items[i].icon !== undefined) this.items[i].icon.remove();
		}
		this.container.remove();
	};
}
