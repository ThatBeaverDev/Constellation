import { isCommandLine } from "../getPlatform.js";
import { constructDOMInterface } from "../io/getShadowDom.js";
import ConstellationKernel, { Terminatable } from "../kernel.js";

export interface Handler extends Terminatable {
	init(): Promise<void>;

	post(text: string): void;

	getInput(query: string): string | Promise<string>;
}

class CommandLineHandler implements Handler {
	#readline?: typeof import("node:readline");
	#ConstellationKernel: ConstellationKernel;

	constructor(ConstellationKernel: ConstellationKernel) {
		this.#ConstellationKernel = ConstellationKernel;
	}

	post = (text: string) => {
		this.#ConstellationKernel.lib.logging.post(text);
	};

	async init() {
		this.#readline = await import("node:readline");
	}

	getInput(query: string): Promise<string> {
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
	}

	terminate() {}
}
class DOMHandler implements Handler {
	#ConstellationKernel: ConstellationKernel;

	#shadowDomHost: HTMLDivElement;
	shadowRoot: ShadowRoot;
	container: HTMLDivElement = document.createElement("div");

	css: HTMLStyleElement = document.createElement("style");

	#newLine(string: string) {
		const line = document.createElement("div");

		const text = document.createElement("p");
		text.innerText = string;
		text.className = "logline";

		line.appendChild(text);

		this.container.appendChild(line);
	}

	constructor(ConstellationKernel: ConstellationKernel) {
		this.#ConstellationKernel = ConstellationKernel;

		this.container = document.createElement("div");
		document.body.appendChild(this.container);

		const { shadowDOM, container, host } = constructDOMInterface();
		this.shadowRoot = shadowDOM;
		this.#shadowDomHost = host;
		this.container = container;

		// add shadowDOM to screen
		document.body.appendChild(this.#shadowDomHost);
	}

	async init() {
		this.css.textContent =
			(await this.#ConstellationKernel.fs.readFile(
				"/System/tui/styles/tui.css"
			)) || "";

		this.container.appendChild(this.css);
	}

	post = (text: string) => {
		this.#newLine(text);
	};

	getInput(query: string) {
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
	}

	terminate() {
		this.#shadowDomHost.remove();
	}
}

const currentHandler = isCommandLine ? CommandLineHandler : DOMHandler;

export default currentHandler;
