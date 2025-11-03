import { Terminatable } from "../../../../system/kernel.js";
import dockAndDesktop from "../tcpsys/app.js";

export interface menubarConfig {}

declare global {
	interface Navigator {
		getBattery?(): Promise<{
			readonly charging: boolean;
			readonly chargingTime: number;
			readonly dischargingTime: number;
			readonly level: number;
		}>;
	}
}

export default class menubar implements Terminatable {
	parent: dockAndDesktop;
	renderer: dockAndDesktop["renderer"];
	env: dockAndDesktop["env"];

	battery:
		| { exists: false }
		| { exists: true; level: number; charging: boolean } = {
		exists: false
	};
	barHeight: number = 35;
	counter: number = 0;

	constructor(parent: dockAndDesktop) {
		this.parent = parent;
		this.renderer = parent.renderer;
		this.env = parent.env;

		if (this.env.windows) this.env.windows.upperBound += this.barHeight;
	}

	async refreshBattery() {
		if (navigator.getBattery) {
			const batteryData = await navigator.getBattery();

			// check for batteryless device
			if (batteryData.level == 1 && batteryData.chargingTime == 0) {
				// there is no battery
				this.battery = { exists: false };
				return;
			}

			this.battery = {
				exists: true,
				level: batteryData.level,
				charging: batteryData.charging
			};
		}
	}

	render() {
		if (!this.env.windows) return;

		if (this.counter % 500 == 0) {
			this.refreshBattery();
		}
		this.counter++;

		this.renderer.box(0, 0, this.renderer.windowWidth, this.barHeight, {
			background: "rgb(from var(--bg-dark) r g b / 0.5)",
			borderRadius: "0px 0px 10px 10",
			isFrosted: true
		});

		// autopadding is 1.5 (15px text size, 18px paragraph height)
		let fontSize = 15;
		const textPadding = (this.barHeight - (fontSize + 3)) / 2;

		let x = (this.barHeight - 24) / 2;

		x += textPadding;

		// ----- left -----

		// ----- centre -----
		const focus = this.env.windows.getFocus();

		let focusName = String(
			focus?.shortName || focus?.name || focus?.applicationDirectory
		);
		switch (focusName) {
			case "undefined":
			case "guimgr":
			case "Constellation":
				focusName = "Desktop";
				break;
		}

		const focusWidth = this.renderer.getTextWidth(focusName);
		const focusLeft = (this.renderer.windowWidth - focusWidth) / 2;
		this.renderer.text(focusLeft, textPadding, focusName);

		// ----- right -----
		const date = new Date();
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = String(date.getFullYear()).padStart(2, "0");
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		const seconds = String(date.getSeconds()).padStart(2, "0");

		const time = `${day}/${month}/${year} | ${hours}:${minutes}:${seconds}`;
		const timeWidth = this.renderer.getTextWidth(time);

		// date and time
		this.renderer.text(
			this.renderer.windowWidth - timeWidth - textPadding,
			textPadding,
			time
		);

		// battery
		if (this.battery.exists) {
			this.renderer.icon(0, 0, "battery");
		}
	}

	terminate() {
		if (this.env.windows) this.env.windows.upperBound -= this.barHeight;
	}
}
