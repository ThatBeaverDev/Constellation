import { IPCMessage } from "../../../runtime/messages.js";
import { evaluate, tokenise } from "../resources/logic.js";

export default class calc extends Application {
	text: string = "";
	mode: "type" | "answer" = "type";
	result: number = 0;
	async init() {
		this.renderer.windowName = "Calculator";
		this.renderer.setIcon("calculator");
	}

	onmessage(msg: IPCMessage) {
		switch (msg.originDirectory) {
			case "/System/io/keyboard.js":
				console.log(msg);
				break;
		}
	}

	frame() {
		this.renderer.clear();

		const padding = 2;
		const borderRadius = 5;

		const baseY = 30;
		const textHeight = 15 * 1.2;
		if (this.mode == "answer") {
			const result = String(this.result);

			this.renderer.text(
				0,
				(baseY - textHeight) / 2,
				`${this.text} = ${result}`
			);
		} else {
			this.renderer.text(0, (baseY - textHeight) / 2, this.text);
		}

		const isWide = this.renderer.windowWidth > 575;

		let gridWidth;
		let gridHeight;

		let grid: Record<string, Function>[];

		if (isWide) {
			gridWidth = 11;
			gridHeight = 4;

			grid = [
				{
					DEL: () =>
						(this.text = this.text.substring(
							0,
							this.text.length - 1
						)),
					CLEAR: () => (this.text = ""),
					SPACE: () => (this.text += " "),
					x: () => (this.text += "x"),
					y: () => (this.text += "y"),
					r: () => (this.text += "r"),
					n: () => (this.text += "n"),
					π: () => (this.text += "π"),
					e: () => (this.text += "e"),
					"+/-": () => {},
					"=": () => {
						this.mode = "answer";
						try {
							this.result = evaluate(this.text);
						} catch (e: any) {
							this.text = String(e);
							this.result = NaN;
						}
					}
				},
				{
					"1": () => (this.text += "1"),
					"2": () => (this.text += "2"),
					"3": () => (this.text += "3"),
					"4": () => (this.text += "4"),
					"5": () => (this.text += "5"),
					"6": () => (this.text += "6"),
					"7": () => (this.text += "7"),
					"8": () => (this.text += "8"),
					"9": () => (this.text += "9"),
					"0": () => (this.text += "0"),
					".": () => (this.text += ".")
				},
				{
					"+": () => (this.text += "+"),
					"-": () => (this.text += "-"),
					"*": () => (this.text += "*"),
					"/": () => (this.text += "/"),
					"%": () => (this.text += "%"),
					"(": () => (this.text += "("),
					")": () => (this.text += ")"),
					"√": () => (this.text += "√"),
					sin: () => (this.text += "~"),
					cos: () => (this.text += "\\"),
					tan: () => (this.text += "|")
				},
				{
					a: () => (this.text += "a"),
					b: () => (this.text += "b"),
					c: () => (this.text += "c"),
					d: () => (this.text += "d")
				}
			];
		} else {
			gridWidth = 4;
			gridHeight = 5;

			grid = [
				{
					DEL: () =>
						(this.text = this.text.substring(
							0,
							this.text.length - 1
						)),
					CLEAR: () => (this.text = ""),
					"%": () => (this.text += "%"),
					"/": () => (this.text += "/")
				},
				{
					"7": () => (this.text += "7"),
					"8": () => (this.text += "8"),
					"9": () => (this.text += "9"),
					"*": () => (this.text += "*")
				},
				{
					"4": () => (this.text += "4"),
					"5": () => (this.text += "5"),
					"6": () => (this.text += "6"),
					"-": () => (this.text += "-")
				},
				{
					"1": () => (this.text += "1"),
					"2": () => (this.text += "2"),
					"3": () => (this.text += "3"),
					"+": () => (this.text += "+")
				},
				{
					"+/-": () => {},
					"0": () => (this.text += "0"),
					".": () => (this.text += "."),
					"=": () => {
						this.mode = "answer";
						try {
							this.result = evaluate(this.text);
						} catch (e: any) {
							this.text = String(e);
							this.result = NaN;
						}
					}
				}
			];
		}

		const colours: Record<string, string> = {
			a: "var(--main-theme-quinary)",
			b: "var(--main-theme-quinary)",
			c: "var(--main-theme-quinary)",
			d: "var(--main-theme-quinary)",
			e: "var(--main-theme-quinary)",
			n: "var(--main-theme-quinary)",
			r: "var(--main-theme-quinary)",
			x: "var(--main-theme-quinary)",
			y: "var(--main-theme-quinary)",
			z: "var(--main-theme-quinary)",
			π: "var(--main-theme-quinary)",

			"+": "var(--main-theme-secondary)",
			"-": "var(--main-theme-secondary)",
			"*": "var(--main-theme-secondary)",
			"/": "var(--main-theme-secondary)",
			"√": "var(--main-theme-secondary)",
			".": "var(--main-theme-secondary)",
			"=": "var(--main-theme-secondary)",
			"%": "var(--main-theme-secondary)",
			"(": "var(--main-theme-secondary)",
			")": "var(--main-theme-secondary)",
			sin: "var(--main-theme-secondary)",
			cos: "var(--main-theme-secondary)",
			tan: "var(--main-theme-secondary)",
			SPACE: "var(--main-theme-quaternary)",
			DEL: "var(--main-theme-quaternary)",
			CLEAR: "var(--main-theme-quaternary)"
		};

		let boxWidth = this.renderer.windowWidth / gridWidth;
		let boxHeight = (this.renderer.windowHeight - baseY) / gridHeight;

		let y = baseY;
		for (const i in grid) {
			let x = 0;
			for (const text in grid[i]) {
				const box = this.renderer.box(
					x,
					y,
					boxWidth - padding,
					boxHeight - padding,
					{
						borderRadius,
						background: colours[text]
					}
				);

				if (this.mode == "type") {
					this.renderer.onClick(box, grid[i][text], undefined, {
						scale: 1.05,
						clickScale: 1.1
					});
				} else {
					this.renderer.onClick(
						box,
						() => {
							this.text = "";
							this.mode = "type";
							grid[i][text]();
						},
						undefined,
						{ scale: 1.05, clickScale: 1.1 }
					);
				}

				const width = this.renderer.getTextWidth(text);
				const height = 15 * 1.2;

				const textX = x + (boxWidth - width) / 2;
				const textY = y + (boxHeight - height) / 2;

				const textElem = this.renderer.text(textX, textY, text);
				this.renderer.passthrough(textElem);

				x += boxWidth;
			}
			y += boxHeight;
		}

		this.renderer.commit();
	}
}
