import { keyboardShortcutsAPI } from "../fs/keyboardShortcuts.js";
import { Icons } from "./icons.js";
import ConstellationKernel, { Terminatable } from "../kernel.js";
import WindowSystem from "./windows/windows.js";
import UiKitInstanceCreator from "./uiKit/uiKit.js";

export class GraphicalInterface implements Terminatable {
	icons: Icons & Terminatable;
	getIcon: Icons["getIcon"];
	windows: WindowSystem & Terminatable;
	keyboardShortcuts: keyboardShortcutsAPI & Terminatable;
	uiKit: UiKitInstanceCreator & Terminatable;

	constructor(ConstellationKernel: ConstellationKernel) {
		this.icons = new Icons(ConstellationKernel);
		this.getIcon = this.icons.getIcon.bind(this.icons);
		this.windows = new WindowSystem(ConstellationKernel);
		this.keyboardShortcuts = new keyboardShortcutsAPI(ConstellationKernel);

		this.uiKit = new UiKitInstanceCreator(ConstellationKernel);
	}

	async init() {
		await this.uiKit.init();
	}

	setStatus(text: string | Error, state: "working" | "error" = "working") {
		if (text instanceof Error) {
			const style = document.createElement("style");
			style.textContent = `
			img.bootImage {
				filter: hue-rotate(80deg) saturate(1000%) !important;
			}
	
			p.bootText {
				color: red !important;
			}
	
			span.loader {
				border-color: red !important;
			}
	
			span.loader::after {
				background-color: red !important;
				animation: none !important;
				width: 100%;
			}
			`;
			document.body.appendChild(style);

			setTimeout(() => {
				throw text;
			}, 5000);
		}
	}

	async terminate() {
		await this.windows.terminate();
		await this.keyboardShortcuts.terminate();
		await this.uiKit.terminate();
	}
}
