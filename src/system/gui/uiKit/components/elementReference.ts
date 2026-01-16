import { clickReference, onClickOptions } from "../definitions.js";
import { UiKitRenderer } from "../uiKit.js";

export class UiKitElement {
	#renderer: UiKitRenderer;
	id: string | number;
	constructor(renderer: UiKitRenderer, id: string | number) {
		this.#renderer = renderer;
		this.id = id;
	}

	toString() {
		return String(this.id);
	}

	onClick(
		leftClickCallback?: clickReference["left"],
		rightClickCallback?: clickReference["right"],
		otherConfig?: onClickOptions
	) {
		this.#renderer.onClick(
			this,
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
		this.#renderer.setElementDragResult(this, type, path);

		return this;
	}

	onDrop(callback: Function) {
		this.#renderer.onElementDrop(this, callback);

		return this;
	}
}

export class UiKitTextboxElement extends UiKitElement {
	#renderer: UiKitRenderer;

	constructor(renderer: UiKitRenderer, id: string | number) {
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

	focus() {
		this.#renderer.focusTextbox(this);
	}

	getSelection() {
		return this.#renderer.getTextboxSelection(this);
	}
}

export class UiKitTextareaElement extends UiKitTextboxElement {
	#renderer: UiKitRenderer;

	constructor(renderer: UiKitRenderer, id: string | number) {
		super(renderer, id);

		this.#renderer = renderer;
	}

	getScroll() {
		return this.#renderer.getTextareaScroll(this);
	}
}

export class uikitProgressBarElement extends UiKitElement {
	#renderer: UiKitRenderer;

	constructor(renderer: UiKitRenderer, id: string | number) {
		super(renderer, id);

		this.#renderer = renderer;
	}

	dragTo(progress: number) {
		this.#renderer.setProgressbarDrag(this, progress);
	}
}
