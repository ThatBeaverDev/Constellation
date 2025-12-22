import systemSettings from "../bin/app.js";
import { softwareupdateResult } from "../../../services/SoftwareUpdateHandler/lib/softwareupdate.js";
// @ts-expect-error
import { ConstellationWindowManagerWallpaper } from "/System/CoreExecutables/guiManager.appl/components/wallpaper.js";

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
	#parent: systemSettings;
	#renderer: systemSettings["renderer"];
	#env: systemSettings["env"];
	#setPage: (page: page) => void;
	constructor(parent: systemSettings, setPage: (page: page) => void) {
		this.#parent = parent;
		this.#renderer = parent.renderer;
		this.#env = parent.env;
		this.#setPage = setPage;
	}

	Home() {
		this.#parent.panelkit.reset();

		const title = this.#parent.panelkit.title;
		const item = this.#parent.panelkit.item;

		// networking
		title("Networking");
		item("Updates", "cloud-download", () => {
			this.#setPage("Updates");
		});
		item("Network", "globe", () => {
			this.#setPage("Network");
		});
		item("Cloud", "cloud", () => {
			this.#setPage("Cloud");
		});

		// system components
		title("Graphical Shell");
		//item("Dock", "dock");
		//item("Menubar", "panels-top-left");
		item("Wallpaper", "wallpaper", () => {
			this.#setPage("Wallpaper");
		});

		title("System");
		item("Users", "users", () => {
			this.#setPage("Users");
		});
	}

	// networking
	#updateStatus?: {
		sysver: string;
		sysbuild: number;
		cliResult?: softwareupdateResult | { state: "error"; error: Error };
	};
	async Updates() {
		this.#parent.panelkit.reset();

		const title = this.#parent.panelkit.title;
		const card = this.#parent.panelkit.card;
		const bigCard = this.#parent.panelkit.bigCard;

		if (this.#updateStatus == undefined) {
			this.#updateStatus = {
				sysver: (await this.#env.fs.include("/System/manifest.js"))
					.version,
				sysbuild: (await this.#env.fs.include("/System/buildver.js"))
					.buildNumber
			};
		}

		if (this.#updateStatus.cliResult == undefined) {
			try {
				await this.#env.shell.index();

				this.#updateStatus.cliResult = ((
					await this.#env.shell.exec("softwareupdate", "statusjson")
				)?.result as softwareupdateResult) || { state: "checking" };
			} catch (e: unknown) {
				this.#updateStatus.cliResult = {
					state: "error",
					error: e as Error
				};
			}
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
					undefined,
					{
						type: "button",
						text: "Install",
						icon: "hard-drive-download",
						onClick: () => {
							this.#env.shell.exec("softwareupdate", "install");
						}
					}
				);

				bigCard(
					`${cliResult.info.name} (build ${cliResult.info.buildNumber})`,
					cliResult.info.description,
					cliResult.info.githubRelease
				);

				break;
			case "error":
				card(
					`Failed to run software update utility (${String(cliResult.error)})`,
					"triangle-alert"
				);
		}
	}
	Network() {
		this.#parent.panelkit.reset();

		const title = this.#parent.panelkit.title;
		const card = this.#parent.panelkit.card;

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
		this.#parent.panelkit.reset();

		const title = this.#parent.panelkit.title;
		const card = this.#parent.panelkit.card;

		title("Cloud Integrations");
		card("Cloud integration is not supported at this time.", "cloud-off");
	}

	// GUI shell
	//Dock() {}
	//Menubar() {}

	#wallpaperDirectories = ["/System/CoreAssets/Wallpapers"];
	#wallpapers?: string[];
	async Wallpaper() {
		this.#parent.panelkit.reset();

		const panelKit = this.#parent.panelkit;

		panelKit.title("Wallpaper");

		if (!this.#wallpapers) {
			const wallpapers = [];

			for (const directory of this.#wallpaperDirectories) {
				const contents = await this.#env.fs.listDirectory(directory);
				const images = contents.filter(
					(item) =>
						item.endsWith(".png") ||
						item.endsWith(".jpg") ||
						item.endsWith(".jpeg") ||
						item.endsWith(".webp")
				);

				const paths = images.map((item) =>
					this.#env.fs.resolve(directory, item)
				);

				wallpapers.push(...paths);
			}

			this.#wallpapers = wallpapers;
		}

		const userinfo = this.#env.users.userInfo(this.#env.user);
		if (!userinfo) return;

		panelKit.card(
			`Current Wallpaper: ${userinfo.pictures.wallpaper ?? `${ConstellationWindowManagerWallpaper.defaultWallpaper} (default)`}`,
			userinfo.pictures.wallpaper ??
				ConstellationWindowManagerWallpaper.defaultWallpaper
		);

		panelKit.title("Choices");

		panelKit.mediumCard(
			"Default",
			"The default wallpaper of Constellation. Changes occassionally.",
			ConstellationWindowManagerWallpaper.defaultWallpaper,
			() => {
				this.#changeWallpaper(
					ConstellationWindowManagerWallpaper.defaultWallpaper
				);
			}
		);
		for (const path of this.#wallpapers) {
			panelKit.mediumCard(
				path.textAfterAll("/").textBeforeLast("."),
				path,
				path,
				() => {
					this.#changeWallpaper(path);
				}
			);
		}
	}
	async #changeWallpaper(path: string) {
		const isOk = await this.#renderer.showUserPrompt(
			"Are you sure you want to change your wallpaper?",
			"",
			"Change it",
			"Leave it"
		);

		if (isOk == "secondary") return;

		await this.#env.shell.index();
		await this.#env.shell.exec("wallpaper", path);

		const userInfo = parent.env.users.userInfo(parent.env.user);
		if (!userInfo) return;

		userInfo.pictures.changeWallpaper(path);
	}

	// system
	#usersState: { tab: "default" } | { tab: "viewUser"; user: string } = {
		tab: "default"
	};
	async Users() {
		this.#parent.panelkit.reset();

		const title = this.#parent.panelkit.title;
		const card = this.#parent.panelkit.card;

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

					card(
						user.fullName,
						user.pictures.profile,
						undefined,
						undefined,
						{
							type: "button",
							text: "View",
							onClick: () => {
								this.#usersState = {
									tab: "viewUser",
									user: username
								};
							}
						}
					);
				}
				break;
			}
			case "viewUser": {
				const user = this.#env.users.userInfo(this.#usersState.user);
				if (!user) {
					this.#usersState = { tab: "default" };
					return;
				}

				card(
					user.fullName,
					user.pictures.profile,
					undefined,
					undefined,
					{
						type: "button",
						text: "Back",
						onClick: () => {
							this.#usersState = { tab: "default" };
						}
					}
				);

				card(`Home Directory: ${user.directory}`, "folder");
				card("Password", "lock", undefined, undefined, {
					type: "button",
					text: "Change Password",
					onClick: async () => {
						const oldPassword =
							await this.#renderer.askUserQuestion(
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
					}
				});
			}
		}
	}
}
