import { isCommandLine } from "../getPlatform.js";
import { constructDOMInterface } from "../io/getShadowDom.js";
import ConstellationKernel, { Terminatable } from "../kernel.js";

export interface Handler extends Terminatable {
	init(): Promise<void>;

	post(text: string): void;

	getInput(query: string): Promise<string>;
	clearView(): void;
}

export class CommandLineHandler implements Handler {
	#readline?: typeof import("node:readline");

	post = (text: string) => {
		console.log(text);
	};

	clearView = (): void => {
		console.clear();
	};

	async init() {
		this.#readline = await import("node:readline");
	}

	getInput = (query: string): Promise<string> => {
		return new Promise((resolve: (result: string) => void) => {
			if (this.#readline == undefined) {
				resolve("");
				return;
			}

			const rl = this.#readline.createInterface({
				input: process.stdin,
				output: process.stdout
			});

			rl.question(query, (response: string) => {
				resolve(response);
				rl.close();
			});
		});
	};

	terminate() {}
}
export class DOMHandler implements Handler {
	#ConstellationKernel: ConstellationKernel;

	#shadowDomHost?: HTMLDivElement;
	shadowRoot?: ShadowRoot;
	container: HTMLDivElement = document.createElement("div");
	#logElements: HTMLElement[] = [];

	css: HTMLStyleElement = document.createElement("style");

	#newLine(string: string) {
		const line = document.createElement("div");
		line.className = "logdiv";

		const text = document.createElement("p");
		text.innerText = string;
		text.className = "logline";

		line.appendChild(text);

		this.#logElements.push(line);
		this.container.appendChild(line);
	}

	constructor(
		ConstellationKernel: ConstellationKernel,
		tuiContainer?: HTMLDivElement
	) {
		this.#ConstellationKernel = ConstellationKernel;

		if (tuiContainer) {
			this.container = tuiContainer;
		} else {
			this.container = document.createElement("div");
			document.body.appendChild(this.container);

			const { shadowDOM, container, host } = constructDOMInterface();
			this.shadowRoot = shadowDOM;
			this.#shadowDomHost = host;
			this.container = container;

			// add shadowDOM to screen
			document.body.appendChild(this.#shadowDomHost);
		}
	}

	async init() {
		this.css.textContent =
			(await this.#ConstellationKernel.fs.readFile(
				"/System/tui/styles/tui.css"
			)) || "";

		this.container.appendChild(this.css);
	}

	post = (text: string) => {
		const lines = text.split("\n").filter((item) => item !== "");

		for (const line of lines) {
			this.#newLine(line);
		}
	};

	clearView = () => {
		this.#logElements.forEach((element) => element.remove());

		this.#logElements = [];
	};

	getInput = (query: string) => {
		const container = document.createElement("div");
		container.className = "prompt";

		const pretext = document.createElement("p");
		pretext.innerText = query;

		const input = document.createElement("input");
		input.type = "text";
		input.inputMode = "text";

		container.appendChild(pretext);
		container.appendChild(input);

		this.container.appendChild(container);
		input.focus();

		return new Promise((resolve: (data: string) => void) => {
			input.addEventListener("keydown", (event) => {
				if (event.code == "Enter") {
					const result = String(input.value);

					container.remove();
					this.post(query + result);

					resolve(result);
				}
			});
		});
	};

	terminate() {
		this.container.remove();
		if (this.#shadowDomHost) this.#shadowDomHost.remove();
	}
}

const currentHandler = isCommandLine ? CommandLineHandler : DOMHandler;

export default currentHandler;
