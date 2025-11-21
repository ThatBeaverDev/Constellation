import systemSettings from "../bin/app.js";
import { softwareupdateResult } from "../../../services/SoftwareUpdateHandler/lib/softwareupdate.js";

export const pages = [
	"Updates",
	"Network",
	"Dock",
	"Menubar",
	"Users",
	"Cloud"
];

type page = keyof SettingsPages;

export class SettingsPages {
	#renderer: systemSettings["renderer"];
	#env: systemSettings["env"];
	#sidebarWidth: number = 100;
	#setPage: (page: page) => void;
	constructor(
		renderer: systemSettings["renderer"],
		env: systemSettings["env"],
		sidebarWidth: number,
		setPage: (page: page) => void
	) {
		this.#renderer = renderer;
		this.#env = env;
		this.#sidebarWidth = sidebarWidth;
		this.#setPage = setPage;
	}

	Home() {
		const padding = 15;

		let x = this.#sidebarWidth + padding;
		let y = padding;
		let hasRendered = false;

		const itemScale = 1.5;
		const itemSize = 50 * itemScale;
		const item = (name: page, icon: string) => {
			hasRendered = true;
			const iconNameGap = 5;

			this.#renderer
				.box(x, y, itemSize, itemSize, {
					background: "sidebar",
					borderRadius: 4
				})
				.onClick(
					() => {
						this.#setPage(name);
					},
					undefined,
					{
						scale: 1.1,
						clickScale: 1.2
					}
				);

			// sizes
			const iconSize = 24 * itemScale;
			const nameWidth = this.#renderer.getTextWidth(name);
			const nameHeight = this.#renderer.getTextHeight(name);

			// icon positions
			const iconLeft = x + (itemSize - iconSize) / 2;
			const iconTop =
				y + (itemSize - (iconSize + iconNameGap + nameHeight)) / 2;

			// name positions
			const nameLeft = x + (itemSize - nameWidth) / 2;
			const nameTop =
				y +
				(iconSize + iconNameGap) +
				(itemSize - (iconSize + iconNameGap + nameHeight)) / 2;

			// draw icon
			this.#renderer.icon(iconLeft, iconTop, icon, 1.5).passthrough();

			// draw name
			this.#renderer.text(nameLeft, nameTop, name).passthrough();

			x += itemSize + padding;

			if (x > this.#renderer.windowWidth) {
				x = this.#sidebarWidth + padding;
				y += itemSize + padding;
			}
		};

		const title = (text: string) => {
			if (hasRendered) {
				// next line
				x = this.#sidebarWidth + padding;
				y += itemSize + padding;
			}

			hasRendered = true;

			// draw text
			this.#renderer.text(x, y, text, 17);

			// calculate height
			const titleHeight = this.#renderer.getTextHeight(text, 17);

			// next line
			x = this.#sidebarWidth + padding;
			y += titleHeight + padding;
		};

		// networking
		title("Networking");
		item("Updates", "cloud-download");
		item("Network", "globe");
		item("Cloud", "cloud");

		// system components
		//title("Shell & System");
		title("System");
		//item("Dock", "dock");
		//item("Menubar", "panels-top-left");
		item("Users", "users");
	}

	// networking
	#updateStatus?: {
		sysver: string;
		sysbuild: number;
		cliResult?: softwareupdateResult;
	};
	async Updates() {
		const padding = 15;

		let x = this.#sidebarWidth + padding;
		let y = padding;
		let hasRendered = false;

		const cardScale = 1.5;
		const cardSize = 30 * cardScale;
		const card = (
			name: string,
			icon: string,
			onclick?: (x: number, y: number) => void,
			button?: {
				text: string;
				icon?: string;
				callback: () => Promise<void> | void;
			}
		) => {
			hasRendered = true;

			const cardWidth =
				this.#renderer.windowWidth - this.#sidebarWidth - padding * 2;

			this.#renderer
				.box(x, y, cardWidth, cardSize, {
					background: "sidebar",
					borderRadius: 10
				})
				.onClick(onclick, undefined, {
					scale: 1.1,
					clickScale: 1.2
				});

			// sizes
			const iconSize = 24 * cardScale;
			const nameHeight = this.#renderer.getTextHeight(name);

			// icon positions
			const iconLeft = x + (cardSize - iconSize) / 2;
			const iconTop = y + (cardSize - iconSize) / 2;

			// name positions
			const nameLeft = iconLeft + (iconSize + 5);
			const nameTop = y + (cardSize - nameHeight) / 2;

			// draw icon
			this.#renderer.icon(iconLeft, iconTop, icon, 1.5).passthrough();

			// draw name
			this.#renderer.text(nameLeft, nameTop, name).passthrough();

			if (button) {
				const textWidth = this.#renderer.getTextWidth(button.text);
				const textHeight = this.#renderer.getTextHeight(button.text);
				const iconWidth =
					button.icon == undefined ? 0 : 24 * cardScale + 5;
				const buttonWidth = iconWidth + textWidth + 10;

				const buttonLeft = x + (cardWidth - (buttonWidth + 5));
				const textTop = y + (cardSize - textHeight) / 2;

				this.#renderer
					.box(buttonLeft, y + 5, buttonWidth, cardSize - 10, {
						background: "var(--bg-lighter)",
						borderRadius: 5
					})
					.onClick(button.callback);

				if (button.icon) {
					this.#renderer
						.icon(buttonLeft + 5, y + 10, button.icon)
						.passthrough();

					const textLeft = buttonLeft + iconSize + 5;

					this.#renderer
						.text(textLeft, textTop, button.text)
						.passthrough();
				} else {
					this.#renderer
						.text(buttonLeft + 5, textTop, button.text)
						.passthrough();
				}
			}

			y += cardSize + padding;
		};

		const title = (text: string) => {
			if (hasRendered) {
				// next line
				x = this.#sidebarWidth + padding;
				y += cardSize + padding;
			}

			hasRendered = true;

			// draw text
			this.#renderer.text(x, y, text, 17);

			// calculate height
			const titleHeight = this.#renderer.getTextHeight(text, 17);

			// next line
			x = this.#sidebarWidth + padding;
			y += titleHeight + padding;
		};

		const bigCard = (title: string, subtext: string, href?: string) => {
			hasRendered = true;

			const cardWidth =
				this.#renderer.windowWidth - this.#sidebarWidth - padding * 2;

			const name = this.#renderer.insertNewlines(title, cardWidth - 10);
			const description = this.#renderer.insertNewlines(
				subtext,
				cardWidth - 10
			);
			const link = href
				? this.#renderer.insertNewlines(href, cardWidth - 10)
				: undefined;

			const titleHeight = this.#renderer.getTextHeight(name, 18);

			const textTop = y + 5;

			const descriptionHeight = this.#renderer.getTextHeight(description);
			const descriptionTop = textTop + 5 + titleHeight;

			const linkHeight = link
				? this.#renderer.getTextHeight(link) + 5
				: 5;
			const linkTop = descriptionTop + 5 + descriptionHeight;

			const cardHeight =
				titleHeight + descriptionHeight + linkHeight + 15;

			this.#renderer.box(x, y, cardWidth, cardHeight, {
				background: "sidebar",
				borderRadius: 10
			});
			this.#renderer.text(x + 5, textTop, name, 18).passthrough();
			this.#renderer
				.text(x + 5, descriptionTop, description)
				.passthrough();
			if (link) {
				this.#renderer.text(x + 5, linkTop, link).passthrough();
			}

			y += cardSize + padding;
		};

		if (this.#updateStatus == undefined) {
			this.#updateStatus = {
				sysver: (await this.#env.include("/System/manifest.js"))
					.version,
				sysbuild: (await this.#env.include("/System/buildver.js"))
					.buildNumber
			};
		}

		if (this.#updateStatus.cliResult == undefined) {
			this.#updateStatus.cliResult = ((
				await this.#env.shell.exec("softwareupdate", "statusjson")
			)?.result as softwareupdateResult) || { state: "checking" };
		}

		const state = this.#updateStatus;

		title(
			`Currently Installed: ${this.#updateStatus.sysver} (build ${this.#updateStatus.sysbuild})`
		);

		const cliResult = state.cliResult;

		switch (cliResult?.state) {
			case "checking":
				card("Checking...", "loader");
				break;
			case "notNeeded":
				card("Constellation is up to date", "check");
				break;
			case "needed":
				card(
					"Constellation has updates to install.",
					"rss",
					undefined,
					{
						text: "Install",
						icon: "hard-drive-download",
						callback: () => {
							this.#env.exec(
								"/System/CoreExecutables/SoftwareUpdateInstaller.srvc"
							);
						}
					}
				);

				bigCard(
					`${cliResult.info.name} (build ${cliResult.info.buildNumber})`,
					cliResult.info.description,
					cliResult.info.githubRelease
				);

				break;
		}
	}
	Network() {
		const padding = 15;

		let x = this.#sidebarWidth + padding;
		let y = padding;
		let hasRendered = false;

		const cardScale = 1.5;
		const cardSize = 30 * cardScale;
		const card = (
			name: string,
			icon: string,
			onclick?: (x: number, y: number) => void,
			button?: {
				text: string;
				icon?: string;
				callback: () => Promise<void> | void;
			}
		) => {
			hasRendered = true;

			const cardWidth =
				this.#renderer.windowWidth - this.#sidebarWidth - padding * 2;

			this.#renderer
				.box(x, y, cardWidth, cardSize, {
					background: "sidebar",
					borderRadius: 10
				})
				.onClick(onclick, undefined, {
					scale: 1.1,
					clickScale: 1.2
				});

			// sizes
			const iconSize = 24 * cardScale;
			const nameHeight = this.#renderer.getTextHeight(name);

			// icon positions
			const iconLeft = x + (cardSize - iconSize) / 2;
			const iconTop = y + (cardSize - iconSize) / 2;

			// name positions
			const nameLeft = iconLeft + (iconSize + 5);
			const nameTop = y + (cardSize - nameHeight) / 2;

			// draw icon
			this.#renderer.icon(iconLeft, iconTop, icon, 1.5).passthrough();

			// draw name
			this.#renderer.text(nameLeft, nameTop, name).passthrough();

			if (button) {
				const textWidth = this.#renderer.getTextWidth(button.text);
				const textHeight = this.#renderer.getTextHeight(button.text);
				const iconWidth =
					button.icon == undefined ? 0 : 24 * cardScale + 5;
				const buttonWidth = iconWidth + textWidth + 10;

				const buttonLeft = x + (cardWidth - (buttonWidth + 5));
				const textTop = y + (cardSize - textHeight) / 2;

				this.#renderer
					.box(buttonLeft, y + 5, buttonWidth, cardSize - 10, {
						background: "var(--bg-lighter)",
						borderRadius: 5
					})
					.onClick(button.callback);

				if (button.icon) {
					this.#renderer
						.icon(buttonLeft + 5, y + 10, button.icon)
						.passthrough();

					const textLeft = buttonLeft + iconSize + 5;

					this.#renderer
						.text(textLeft, textTop, button.text)
						.passthrough();
				} else {
					this.#renderer
						.text(buttonLeft + 5, textTop, button.text)
						.passthrough();
				}
			}

			y += cardSize + padding;
		};

		const title = (text: string) => {
			if (hasRendered) {
				// next line
				x = this.#sidebarWidth + padding;
				y += cardSize + padding;
			}
			hasRendered = true;

			// draw text
			this.#renderer.text(x, y, text, 17);

			// calculate height
			const titleHeight = this.#renderer.getTextHeight(text, 17);

			// next line
			x = this.#sidebarWidth + padding;
			y += titleHeight + padding;
		};

		title("Network Adapters");
		card("Host Network Connection", "chevrons-left-right-ellipsis");

		title("Connection");
		if (globalThis.navigator.onLine) {
			card("Network: Connected", "cloud");
		} else {
			card("Network: Disconnected", "cloud-off");
		}
	}
	Cloud() {
		const padding = 15;

		let x = this.#sidebarWidth + padding;
		let y = padding;
		let hasRendered = false;

		const cardScale = 1.5;
		const cardSize = 30 * cardScale;
		const card = (
			name: string,
			icon: string,
			onclick?: (x: number, y: number) => void,
			button?: {
				text: string;
				icon?: string;
				callback: () => Promise<void> | void;
			}
		) => {
			hasRendered = true;

			const cardWidth =
				this.#renderer.windowWidth - this.#sidebarWidth - padding * 2;

			this.#renderer
				.box(x, y, cardWidth, cardSize, {
					background: "sidebar",
					borderRadius: 10
				})
				.onClick(onclick, undefined, {
					scale: 1.1,
					clickScale: 1.2
				});

			// sizes
			const iconSize = 24 * cardScale;
			const nameHeight = this.#renderer.getTextHeight(name);

			// icon positions
			const iconLeft = x + (cardSize - iconSize) / 2;
			const iconTop = y + (cardSize - iconSize) / 2;

			// name positions
			const nameLeft = iconLeft + (iconSize + 5);
			const nameTop = y + (cardSize - nameHeight) / 2;

			// draw icon
			this.#renderer.icon(iconLeft, iconTop, icon, 1.5).passthrough();

			// draw name
			this.#renderer.text(nameLeft, nameTop, name).passthrough();

			if (button) {
				const textWidth = this.#renderer.getTextWidth(button.text);
				const textHeight = this.#renderer.getTextHeight(button.text);
				const iconWidth =
					button.icon == undefined ? 0 : 24 * cardScale + 5;
				const buttonWidth = iconWidth + textWidth + 10;

				const buttonLeft = x + (cardWidth - (buttonWidth + 5));
				const textTop = y + (cardSize - textHeight) / 2;

				this.#renderer
					.box(buttonLeft, y + 5, buttonWidth, cardSize - 10, {
						background: "var(--bg-lighter)",
						borderRadius: 5
					})
					.onClick(button.callback);

				if (button.icon) {
					this.#renderer
						.icon(buttonLeft + 5, y + 10, button.icon)
						.passthrough();

					const textLeft = buttonLeft + iconSize + 5;

					this.#renderer
						.text(textLeft, textTop, button.text)
						.passthrough();
				} else {
					this.#renderer
						.text(buttonLeft + 5, textTop, button.text)
						.passthrough();
				}
			}

			y += cardSize + padding;
		};

		const title = (text: string) => {
			if (hasRendered) {
				// next line
				x = this.#sidebarWidth + padding;
				y += cardSize + padding;
			}
			hasRendered = true;

			// draw text
			this.#renderer.text(x, y, text, 17);

			// calculate height
			const titleHeight = this.#renderer.getTextHeight(text, 17);

			// next line
			x = this.#sidebarWidth + padding;
			y += titleHeight + padding;
		};

		title("Cloud Integrations");
		card("Cloud integration is not supported yet.", "cloud-off");
	}

	// GUI shell
	//Dock() {}
	//Menubar() {}

	// system
	#usersState: { tab: "default" } | { tab: "viewUser"; user: string } = {
		tab: "default"
	};
	async Users() {
		const padding = 15;

		let x = this.#sidebarWidth + padding;
		let y = padding;
		let hasRendered = false;

		const cardScale = 1.5;
		const cardSize = 30 * cardScale;
		const card = (
			name: string,
			icon: string,
			onclick?: (x: number, y: number) => void,
			button?: {
				text: string;
				icon?: string;
				callback: () => Promise<void> | void;
			}
		) => {
			hasRendered = true;

			const cardWidth =
				this.#renderer.windowWidth - this.#sidebarWidth - padding * 2;

			this.#renderer
				.box(x, y, cardWidth, cardSize, {
					background: "sidebar",
					borderRadius: 10
				})
				.onClick(onclick, undefined, {
					scale: 1.1,
					clickScale: 1.2
				});

			// sizes
			const iconSize = 24 * cardScale;
			const nameHeight = this.#renderer.getTextHeight(name);

			// icon positions
			const iconLeft = x + (cardSize - iconSize) / 2;
			const iconTop = y + (cardSize - iconSize) / 2;

			// name positions
			const nameLeft = iconLeft + (iconSize + 5);
			const nameTop = y + (cardSize - nameHeight) / 2;

			// draw icon
			this.#renderer.icon(iconLeft, iconTop, icon, 1.5).passthrough();

			// draw name
			this.#renderer.text(nameLeft, nameTop, name).passthrough();

			if (button) {
				const textWidth = this.#renderer.getTextWidth(button.text);
				const textHeight = this.#renderer.getTextHeight(button.text);
				const iconWidth =
					button.icon == undefined ? 0 : 24 * cardScale + 5;
				const buttonWidth = iconWidth + textWidth + 10;

				const buttonLeft = x + (cardWidth - (buttonWidth + 5));
				const textTop = y + (cardSize - textHeight) / 2;

				this.#renderer
					.box(buttonLeft, y + 5, buttonWidth, cardSize - 10, {
						background: "var(--bg-lighter)",
						borderRadius: 5
					})
					.onClick(button.callback);

				if (button.icon) {
					this.#renderer
						.icon(buttonLeft + 5, y + 10, button.icon)
						.passthrough();

					const textLeft = buttonLeft + iconSize + 5;

					this.#renderer
						.text(textLeft, textTop, button.text)
						.passthrough();
				} else {
					this.#renderer
						.text(buttonLeft + 5, textTop, button.text)
						.passthrough();
				}
			}

			y += cardSize + padding;
		};

		const title = (text: string) => {
			if (hasRendered) {
				// next line
				x = this.#sidebarWidth + padding;
				y += cardSize + padding;
			}

			hasRendered = true;

			// draw text
			this.#renderer.text(x, y, text, 17);

			// calculate height
			const titleHeight = this.#renderer.getTextHeight(text, 17);

			// next line
			x = this.#sidebarWidth + padding;
			y += titleHeight + padding;
		};

		try {
			this.#env.users.all();
		} catch (e: unknown) {
			await this.#env.requestUserPermission("users");
		}

		switch (this.#usersState.tab) {
			case "default": {
				title("Users");

				const systemUsers = this.#env.users.all();

				for (const username in systemUsers) {
					const user = systemUsers[username];
					if (!user.allowGraphicalLogin) continue;

					card(user.fullName, user.pictures.profile, undefined, {
						text: "View",
						callback: () => {
							this.#usersState = {
								tab: "viewUser",
								user: username
							};
						}
					});
				}
				break;
			}
			case "viewUser": {
				const user = this.#env.users.userInfo(this.#usersState.user);
				if (!user) {
					this.#usersState = { tab: "default" };
					return;
				}

				card(user.fullName, user.pictures.profile, undefined, {
					text: "Back",
					callback: () => {
						this.#usersState = { tab: "default" };
					}
				});

				card(`Home Directory: ${user.directory}`, "folder");
				card("Password", "lock", async () => {
					const oldPassword = await this.#renderer.askUserQuestion(
						`What is ${user.fullName}'s old password?`,
						""
					);

					const pass1 = await this.#renderer.askUserQuestion(
						`What should ${user.fullName}'s new password be?`,
						""
					);
					const pass2 = await this.#renderer.askUserQuestion(
						`Please repeat ${user.fullName}'s new password.`,
						"This is to make sure you didn't make a silly typo or just slap the keyboard."
					);

					if (pass1 !== pass2) {
						this.#renderer.prompt(
							"Passwords don't match.",
							"We're cancelled the password change operation.",
							"user-lock"
						);
					}

					try {
						user.changePassword(oldPassword, pass1);
					} catch (e) {
						this.#renderer.prompt(
							"User password is incorrect.",
							"The correct current password must be entered to change the password.",
							"user-lock"
						);
						return;
					}
				});
			}
		}
	}
}
