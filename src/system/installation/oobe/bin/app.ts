import { PostInstallOptions } from "../../installation.config.js";
import PanelKit from "/System/CoreLibraries/panelkit.js";

type OOBEScreenName =
	| "welcome"
	| "createUser"
	| "customiseUser"
	| "configuring";

export default class GuiOutOfBoxInstaller extends GuiApplication {
	panelkit = new PanelKit(this.renderer);
	page: OOBEScreenName = "welcome";
	returnValue: PostInstallOptions = {
		user: {
			username: "unset",
			password: "",
			displayName: "unset",
			profilePicture: "circle-user-round"
		}
	};
	pipe: any[] = [];
	#message?: string;

	showMessage(text: string) {
		this.#message = text;

		setTimeout(() => {
			this.#message = undefined;
		}, 5000);
	}

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
		this.panelkit.reset();
		this.panelkit.sidebarWidth = 0;

		if (this.#message) {
			const message = this.#message;

			const messageWidth = this.renderer.getTextWidth(message);
			const messageLeft = (this.renderer.windowWidth - messageWidth) / 2;

			this.renderer.text(
				messageLeft,
				this.renderer.windowHeight - 25,
				message
			);
		}

		const bottomRightButton = (text: string, onClick: () => any) => {
			const textWidth = this.renderer.getTextWidth(text);
			const textHeight = this.renderer.getTextHeight(text);

			const boxWidth =
				this.panelkit.padding + textWidth + this.panelkit.padding;
			const boxHeight =
				this.panelkit.padding + textHeight + this.panelkit.padding;

			const boxLeft =
				this.renderer.windowWidth - (boxWidth + this.panelkit.padding);
			const boxTop =
				this.renderer.windowHeight -
				(boxHeight + this.panelkit.padding);

			this.renderer
				.box(boxLeft, boxTop, boxWidth, boxHeight, {
					borderRadius: 5,
					background: "sidebar"
				})
				.onClick(onClick);

			this.renderer
				.text(
					boxLeft + this.panelkit.padding,
					boxTop + this.panelkit.padding,
					text
				)
				.passthrough();
		};
		const bottomLeftText = (text: string) => {
			const textHeight = this.renderer.getTextHeight(text);

			const textLeft = this.panelkit.padding;
			const textTop =
				this.renderer.windowHeight -
				(textHeight + this.panelkit.padding);

			this.renderer.text(textLeft, textTop, text).passthrough();
		};

		switch (this.page) {
			case "welcome":
				this.panelkit.mediumCard(
					"Welcome to Constellation!",
					"Constellation is an entire OS - just in the browser!\n\nThis setup won't take long.",
					"handshake",
					undefined,
					undefined
				);

				bottomRightButton("Continue", () => {
					this.page = "createUser";
				});

				break;

			case "createUser":
				this.panelkit.mediumCard(
					"Create your user account",
					"Enter your details to create your user account.",
					"circle-user-round"
				);

				bottomRightButton("Create Account", () => {
					if (
						this.returnValue.user.displayName !== "" &&
						this.returnValue.user.username !== "" &&
						this.returnValue.user.password !== ""
					) {
						this.page = "customiseUser";
					} else {
						this.showMessage(
							"You need to enter a username and password!"
						);
					}
				});

				const username = this.panelkit.textInput(
					"Username",
					"",
					(contents: string) => {}
				);
				const password = this.panelkit.textInput(
					"Password",
					"",
					(contents: string) => {}
				);

				if (password) this.returnValue.user.password = password;
				if (username) {
					this.returnValue.user.displayName = username;

					const technicalName = username
						.trim()
						.replaceAll(" ", "_")
						.toLocaleLowerCase();

					this.returnValue.user.username = technicalName;

					this.panelkit.info(`Home Folder: /Users/${technicalName}`);
				}

				bottomLeftText("Welcome -> Create User (2/2)");

				break;

			case "customiseUser":
				this.page = "configuring";
				break;

			case "configuring":
				this.panelkit.mediumCard(
					"Working...",
					"Constellation is configuring itself. Please wait.",
					"hammer"
				);

				this.pipe.push(this.returnValue);
				// now we wait to be terminated

				break;

			default:
				throw new Error(
					`OOBEScreen '${this.page}' is not implemented.`
				);
		}

		this.renderer.commit();
	}
}
