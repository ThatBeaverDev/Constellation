import { font, Renderer } from "../../../lib/uiKit/uiKit";
import { ApplicationAuthorisationAPI } from "../../../security/env";
import dockAndDesktop from "../tcpsys/app";

export default class menubar {
	parent: dockAndDesktop;
	renderer: Renderer;
	env: ApplicationAuthorisationAPI;

	barHeight: number = 35;

	constructor(parent: dockAndDesktop) {
		this.parent = parent;
		this.renderer = parent.renderer;
		this.env = parent.env;
	}
	render() {
		this.renderer.box(0, 0, this.renderer.windowWidth, this.barHeight, {
			background: "var(--main-theme-secondary)",
			borderRadius: "0px 0px 10px 10"
		});

		const iconPadding = (this.barHeight - 24) / 2;

		// autopadding is 1.5 (15px text size, 18px paragraph height)
		let fontSize = 15;
		const textPadding = (this.barHeight - (fontSize + 3)) / 2;

		let x = iconPadding;
		const constellationIcon = this.renderer.icon(
			x,
			iconPadding,
			"/System/CoreAssets/Logos/Constellation-lucide.svg"
		);

		const buttons: Record<string, Function> = {};
		buttons[`book-open-text-:-About ${this.parent.config.name}`] = () => {
			// about page
		};
		buttons[`cog-:-Settings`] = () => this.env.exec("/Applications/Settings.appl");
		buttons["rotate-cw-:-Restart"] = () => {}; // TODO: restart
		buttons["power-:-Shut Down"] = () => {}; // TODO: Power off
		buttons["lock-:-Lock"] = () => {}; // TODO: lock, somehow.
		buttons[`log-out-:-Logout from ${this.env.user}`] = () => this.parent.exit();

		const constellationMenu = () => {
			this.renderer.setContextMenu(0, 0, this.parent.config.name, buttons);
		};

		this.renderer.onClick(constellationIcon, constellationMenu, constellationMenu);

		x += 24 + iconPadding;

		x += textPadding;
		const focus = this.env.windows.getFocus();
		this.renderer.text(x, textPadding, String(focus?.shortName || focus?.name || focus?.applicationDirectory));
		x += textPadding;

		const date = new Date();
		let weekDay = (() => {
			switch (date.getDay()) {
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
				case 7:
					return "Sunday";
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

		this.renderer.text(window.innerWidth - timeWidth - textPadding, textPadding, time);
	}
}
