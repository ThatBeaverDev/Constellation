import { ConfigStep } from "../../definitions.js";
import { UiKitRenderer } from "../../uiKit.js";
import { UiKitElement } from "../elementReference.js";
import { ShimmedCSS } from "./cssShim.js";

export class UiKitCanvasElement
	extends UiKitElement
	implements HTMLCanvasElement
{
	#renderer: UiKitRenderer;
	#step: ConfigStep;

	constructor(renderer: UiKitRenderer, step: ConfigStep, id: number) {
		super(renderer, id);

		this.#renderer = renderer;
		this.#step = step;
	}

	get width() {
		return this.#step.args[2];
	}
	get height() {
		return this.#step.args[3];
	}

	// shims
	set width(value: number) {}
	set height(value: number) {}
	style = new ShimmedCSS();

	// @ts-expect-error
	addEventListener(
		type: string,
		listener: Function,
		options?: unknown
	): void {}

	getContext(
		contextId: "2d",
		options?: CanvasRenderingContext2DSettings
	): CanvasRenderingContext2D | null;
	getContext(
		contextId: "bitmaprenderer",
		options?: ImageBitmapRenderingContextSettings
	): ImageBitmapRenderingContext | null;
	getContext(
		contextId: "webgl",
		options?: WebGLContextAttributes
	): WebGLRenderingContext | null;
	getContext(
		contextId: "webgl2",
		options?: WebGLContextAttributes
	): WebGL2RenderingContext | null;
	getContext(contextId: string, options?: any): RenderingContext | null {
		return this.#renderer.getCanvasContext(this, contextId, options);
	}
}
