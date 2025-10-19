import { onClickOptions } from "../definitions.js";
import { UiKitRenderer } from "../uiKit.js";

export class UiKitElement extends Number {
	#renderer: UiKitRenderer;
	#id: number;
	constructor(renderer: UiKitRenderer, id: number) {
		super(id);

		this.#renderer = renderer;
		this.#id = id;
	}

	toString() {
		return String(this.#id);
	}

	onClick(
		leftClickCallback?: Function,
		rightClickCallback?: Function,
		otherConfig?: onClickOptions
	) {
		this.#renderer.onClick(
			this.#id,
			leftClickCallback,
			rightClickCallback,
			otherConfig
		);

		return this;
	}

	passthrough() {
		this.#renderer.passthrough(this);

		return this;
	}
}

export class UiKitTextboxElement extends UiKitElement {
	#renderer: UiKitRenderer;

	constructor(renderer: UiKitRenderer, id: number) {
		super(renderer, id);

		this.#renderer = renderer;
	}

	getContents() {
		return this.#renderer.getTextboxContent(this);
	}

	setContents(value: string) {
		this.#renderer.setTextboxContent(this, value);

		return this;
	}
}
