import { clickReference, onClickOptions } from "../definitions.js";
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
		leftClickCallback?: clickReference["left"],
		rightClickCallback?: clickReference["right"],
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

	dragResult(type: "file", path: string) {
		this.#renderer.setElementDragResult(this.#id, type, path);

		return this;
	}

	onDrop(callback?: Function) {
		this.#renderer.onElementDrop(this.#id, callback);

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
