import { canvasPosition, canvasRenderingStep, step } from "./definitions";

type canvasImageArgs =
	| [dx: number, dy: number, imageURL: string]
	| [
			dx: number,
			dy: number,
			dWidth: number,
			dHeight: number,
			imageURL: string
	  ]
	| [
			sx: number,
			sy: number,
			sWidth: number,
			sHeight: number,
			dx: number,
			dy: number,
			dWidth: number,
			yHeight: number,
			imageURL: string
	  ];

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

	image(canvasID: number, ...args: canvasImageArgs) {
		const canvas = this.#steps[canvasID - 1];
		const renderingSteps = canvas.args[4] || {};

		const url = args.pop();

		const obj: canvasRenderingStep = {
			type: "image",
			data: {
				args,
				url
			}
		};
		renderingSteps.push(obj);

		canvas.args[4] = renderingSteps;
	}
}
