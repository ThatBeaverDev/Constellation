import { PostInstallOptions } from "../../installation.config.js";

type OOBEScreenName =
	| "welcome"
	| "createUser"
	| "customiseUser"
	| "configuring";

interface OOBEScreen {
	icon: string;
	title: string;
	subtext?: string;
	extras?: (baseY: number, spacing: number) => void;
	extraRequiredHeight?: number;
}

export default class outOfBoxInstaller extends Application {
	screen: OOBEScreenName = "welcome";
	returnValue: PostInstallOptions = {
		user: {
			username: "unset",
			password: "",
			displayName: "unset",
			profilePicture: "circle-user-round"
		}
	};
	pipe: any[] = [];

	async init(args: any[]) {
		this.renderer.setIcon("hard-drive-download");
		this.renderer.windowName = "Constellation Setup";

		if (args == undefined)
			throw new Error(
				"OOBEInstaller requires a pipe to return the logininfo from."
			);
		this.pipe = args;
		this.env.debug("Pipe of", args, "recieved.");

		this.renderer.moveWindow(
			this.renderer.displayWidth / 4,
			this.renderer.displayHeight / 4
		);
		this.renderer.resizeWindow(
			this.renderer.displayWidth / 2,
			this.renderer.displayHeight / 2
		);
	}

	frame() {
		this.renderer.clear();

		this.renderScreen(this.screens[this.screen]);

		this.renderer.commit();
	}

	persistentScreenMemory: string = "";
	changeScreen(screenName: OOBEScreenName) {
		this.screen = screenName;

		this.renderer.clear();
		this.renderScreen(this.screens[this.screen]);

		this.renderer.clear();
		this.renderScreen(this.screens[this.screen]);
		this.renderer.commit();
	}
	screens: Record<OOBEScreenName, OOBEScreen> = {
		welcome: {
			icon: "handshake",
			title: "Welcome to Constellation!",
			extras: (y: number) => {
				const iconScale = 1.5;
				const iconDimensions = 24 * iconScale;
				const iconLeft = this.findCenterOfWidth(iconDimensions);

				const icon = this.renderer.icon(
					iconLeft,
					y,
					"circle-arrow-right",
					iconScale
				);

				this.screens.welcome.extraRequiredHeight = iconDimensions;

				this.renderer.onClick(icon, () => {
					this.persistentScreenMemory = "";
					this.changeScreen("createUser");
				});
			},
			extraRequiredHeight: 0
		},
		createUser: {
			icon: "circle-user-round",
			title: "Create your user account",
			subtext: "Enter your details to create your user account.",
			extras: (y: number, spacing: number) => {
				const left = this.findCenterOfWidth(150);
				let yPos = Number(y);

				const displayName = this.renderer.textbox(
					left,
					y,
					150,
					25,
					"Username",
					{}
				);
				yPos += 25 + spacing;

				// display home folder name
				const usernameFetch =
					this.renderer.getTextboxContent(displayName);
				let technicalName: string;
				if (usernameFetch == undefined) {
					technicalName = "";
				} else {
					technicalName = usernameFetch
						.trim()
						.replaceAll(" ", "_")
						.toLocaleLowerCase();
				}
				const technicalNameDisplay = "Home Folder: " + technicalName;

				const usernameFontSize = 10;
				const usernameWidth = this.renderer.getTextWidth(
					technicalNameDisplay,
					usernameFontSize
				);
				const usernameHeight = this.renderer.getTextHeight(
					technicalNameDisplay,
					usernameFontSize
				);
				const usernameLeft = this.findCenterOfWidth(usernameWidth);
				this.renderer.text(
					usernameLeft,
					this.renderer.windowHeight - (spacing + usernameHeight),
					technicalNameDisplay,
					usernameFontSize
				);

				const pass = this.renderer.textbox(
					left,
					yPos,
					150,
					25,
					"Password",
					{}
				);
				yPos += 25 + spacing;

				const buttonText = "Create account";
				const buttonWidth = this.renderer.getTextWidth(buttonText);
				const buttonLeft = this.findCenterOfWidth(buttonWidth);

				this.renderer.box(left, yPos, 150, 25, {
					background: "var(--bg-light)"
				});
				const text = this.renderer.text(
					buttonLeft,
					yPos,
					"Create account",
					15
				);

				this.renderer.onClick(text, () => {
					const name = this.renderer.getTextboxContent(displayName);
					const password = this.renderer.getTextboxContent(pass);

					if (name) this.returnValue.user.displayName = name;
					if (technicalName)
						this.returnValue.user.username = technicalName;
					if (password) this.returnValue.user.password = password;

					this.persistentScreenMemory = "";
					//this.changeScreen("customiseUser");
					this.changeScreen("configuring");
				});

				this.screens.createUser.extraRequiredHeight = yPos - y + 25;
			},
			extraRequiredHeight: 0
		},
		customiseUser: {
			title: "Customise your user account",
			subtext: "Select your accent colour and profile picture.",
			icon: "paintbrush",
			extras: () => {}
		},
		configuring: {
			title: "Setting up Constellation...",
			subtext: "This shouldn't take very long...",
			icon: "loader-circle",
			// @ts-expect-error
			iconAnimation: "spin",
			extras: () => {
				this.pipe.push(this.returnValue);

				// now we wait to be terminated.

				return;
			}
		}
	};

	findCenterOfWidth(width: number) {
		return (this.renderer.windowWidth - width) / 2;
	}

	renderScreen(screen: OOBEScreen) {
		const iconScale = 3;
		const iconDimensions = 24 * iconScale;
		const iconLeft = this.findCenterOfWidth(iconDimensions);

		const titleSize = 25;
		const subtextSize = 15;

		const spacing = 15;

		// title
		const titleWidth = this.renderer.getTextWidth(screen.title, titleSize);
		const titleHeight = this.renderer.getTextHeight(
			screen.title,
			titleSize
		);

		const titleLeft = this.findCenterOfWidth(titleWidth);

		let subtextWidth = 0;
		let subtextHeight = 0;

		if (screen.subtext) {
			// subtext
			subtextWidth = this.renderer.getTextWidth(
				screen.subtext,
				subtextSize
			);
			subtextHeight = this.renderer.getTextHeight(
				screen.subtext,
				subtextSize
			);
		}
		const subtextLeft = this.findCenterOfWidth(subtextWidth);

		const totalHeight =
			iconDimensions +
			spacing +
			titleHeight +
			spacing +
			(subtextHeight == 0 ? 0 : subtextHeight + spacing) +
			(this.screens[this.screen].extraRequiredHeight || 0);

		let y = (this.renderer.windowHeight - totalHeight) / 2;

		this.renderer.icon(iconLeft, y, screen.icon, iconScale);
		y += iconDimensions + spacing;
		this.renderer.text(titleLeft, y, screen.title, titleSize);
		y += titleHeight + spacing;
		if (screen.subtext) {
			this.renderer.text(subtextLeft, y, screen.subtext, subtextSize);
			y += subtextHeight + spacing;
		}

		if (screen.extras) screen.extras(y, spacing);
	}
}
