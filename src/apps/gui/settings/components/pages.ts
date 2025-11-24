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
		//title("Shell & System");
		title("System");
		//item("Dock", "dock");
		//item("Menubar", "panels-top-left");
		item("Users", "users", () => {
			this.#setPage("Users");
		});
	}

	// networking
	#updateStatus?: {
		sysver: string;
		sysbuild: number;
		cliResult?: softwareupdateResult;
	};
	async Updates() {
		this.#parent.panelkit.reset();

		const title = this.#parent.panelkit.title;
		const card = this.#parent.panelkit.card;
		const bigCard = this.#parent.panelkit.bigCard;

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
					undefined,
					{
						type: "button",
						text: "Install",
						icon: "hard-drive-download",
						onClick: () => {
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
