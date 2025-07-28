import { canvasPosition, canvasRenderingStep, step } from "./definitions";

export default class canvasKit {
	#steps: step[];

	constructor(steps: step[]) {
		this.#steps = steps;
	}

	line(
		canvasID: number,
		colour: string,
		startingPosition: canvasPosition,
		...otherPositions: canvasPosition[]
	) {
		const canvas = this.#steps[canvasID - 1];
		const renderingSteps = canvas.args[4] || [];

		const obj: canvasRenderingStep = {
			type: "line",
			data: {
				start: startingPosition,
				end: otherPositions.pop(),
				mids: otherPositions,
				colour
			}
		};
		renderingSteps.push(obj);

		canvas.args[4] = renderingSteps;
	}

	box(
		canvasID: number,
		position1: canvasPosition,
		position2: canvasPosition,
		borderColour: string,
		backgroundColour: string
	) {
		const canvas = this.#steps[canvasID - 1];
		const renderingSteps = canvas.args[4] || {};

		const obj: canvasRenderingStep = {
			type: "rectangle",
			data: { position1, position2, borderColour, backgroundColour }
		};
		renderingSteps.push(obj);

		canvas.args[4] = renderingSteps;
	}

	image(
		canvasID: number,
		position: canvasPosition,
		width: number,
		height: number,
		url: string
	) {
		const canvas = this.#steps[canvasID - 1];
		const renderingSteps = canvas.args[4] || {};

		const obj: canvasRenderingStep = {
			type: "image",
			data: {
				position,
				width,
				height,
				url
			}
		};
		renderingSteps.push(obj);

		canvas.args[4] = renderingSteps;
	}
}
