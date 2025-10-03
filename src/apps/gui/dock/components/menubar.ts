import { UiKitRenderer } from "../../../../gui/uiKit/uiKit";
import dockAndDesktop from "../tcpsys/app";

export interface menubarConfig {}

export default class menubar {
	parent: dockAndDesktop;
	renderer: UiKitRenderer;
	env: dockAndDesktop["env"];

	barHeight: number = 35;

	constructor(parent: dockAndDesktop) {
		this.parent = parent;
		this.renderer = parent.renderer;
		this.env = parent.env;
	}
	render() {
		this.renderer.box(0, 0, this.renderer.windowWidth, this.barHeight, {
			background: "rgb(from var(--backgroundColour) r g b / 0.5)",
			borderRadius: "0px 0px 10px 10",
			isFrosted: true
		});

		const iconPadding = (this.barHeight - 24) / 2;

		// autopadding is 1.5 (15px text size, 18px paragraph height)
		let fontSize = 15;
		const textPadding = (this.barHeight - (fontSize + 3)) / 2;

		let x = iconPadding;

		x += textPadding;
		const focus = this.env.windows.getFocus();
		this.renderer.text(
			x,
			textPadding,
			String(
				focus?.shortName || focus?.name || focus?.applicationDirectory
			)
		);
		x += textPadding;

		const date = new Date();
		let weekDay = (() => {
			switch (date.getDay()) {
				case 0:
					return "Sunday";
				case 1:
					return "Monday";
				case 2:
					return "Tuesday";
				case 3:
					return "Wednesday";
				case 4:
					return "Thursday";
				case 5:
					return "Friday";
				case 6:
					return "Saturday";
			}
		})();
		const day = date.getDate();
		const month = date.getMonth() + 1; // why does .getMonth() return from ZERO TO ELEVEN???
		const year = date.getFullYear();
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const seconds = date.getSeconds();

		const timemap = "WDY DD/MM/YY HH:MNS:SS";

		const mappings = {
			WDY: String(weekDay),
			DD: String(day),
			MM: String(month),
			YY: String(year),
			HH: String(hours).padStart(2, "0"),
			MNS: String(minutes).padStart(2, "0"),
			SS: String(seconds).padStart(2, "0")
		};

		const time = timemap.map(mappings);
		const timeWidth = this.renderer.getTextWidth(time);

		this.renderer.text(
			this.renderer.windowWidth - timeWidth - textPadding,
			textPadding,
			time
		);
	}
}
