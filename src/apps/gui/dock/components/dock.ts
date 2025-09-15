import { UiKitRenderer } from "../../../../gui/uiKit/uiKit";
import { WindowAlias } from "../../../../security/definitions";
import dockAndDesktop from "../tcpsys/app";
import { getAppConfig, pathIcon } from "pathinf";

export interface dockConfig {
	pins: string[];
}

interface Program {
	windows: WindowAlias[];
	isPinned: boolean;
	manifest: ApplicationManifest;
	icon: string;
}

export default class Dock {
	readonly parent: dockAndDesktop;
	readonly renderer: UiKitRenderer;
	readonly env: dockAndDesktop["env"];

	dockHeight: number = 50;
	dockPadding: number = 10;
	wins: WindowAlias[] = [];
	programs: Record<string, Program> = {};
	ok: boolean = false;
	width: number = 0;
	config: dockConfig;
	pinsInfo?: {
		directory: string;
		manifest: ApplicationManifest;
	}[];
	tick: number = 0;

	constructor(parent: dockAndDesktop) {
		this.parent = parent;
		this.renderer = parent.renderer;
		this.env = parent.env;

		this.config = parent.config.dock;

		this.init();
	}

	async init() {
		let getPerms: boolean | undefined = false;
		try {
			getPerms = await this.parent.env.requestUserPermission("windows");
		} catch {}

		if (getPerms !== true) return;

		await this.refresh();

		this.ok = true;
	}

	async refresh() {
		this.wins = this.parent.env.windows.all();

		this.pinsInfo = [];

		for (const i in this.config.pins) {
			const pin = this.config.pins[i];

			this.pinsInfo[i] = {
				directory: pin,
				manifest: await getAppConfig(this.env, pin)
			};
		}

		const programs: Record<string, Program> = {};

		programs[this.parent.directory] = {
			windows: [],
			isPinned: true,
			manifest: await getAppConfig(this.env, this.parent.directory),
			icon: await pathIcon(this.env, this.parent.directory)
		};

		if (this.pinsInfo !== undefined) {
			for (const prog of this.pinsInfo) {
				const progDir = prog.directory;

				if (programs[progDir] == undefined) {
					programs[progDir] = {
						windows: [],
						isPinned: true,
						manifest: await getAppConfig(this.env, progDir),
						icon: await pathIcon(this.env, progDir)
					};
				}
			}
		}

		for (const win of this.wins) {
			const winDir = win.applicationDirectory;
			if (winDir == undefined) continue;

			if (programs[winDir] == undefined) {
				programs[winDir] = {
					windows: [],
					isPinned: this.config.pins.includes(winDir),
					manifest: await getAppConfig(this.env, winDir),
					icon: await pathIcon(this.env, winDir)
				};
			}

			programs[winDir].windows.push(win);
		}

		this.programs = programs;

		this.tick = 0;
	}

	render() {
		if (++this.tick == 5) {
			this.tick = -100000; // refresh sets it to zero.

			this.refresh();
		}

		if (this.ok !== true) return;

		const iconWidth = this.dockHeight - this.dockPadding * 2;
		const iconScale = iconWidth / 24;

		const iconGap = iconWidth + this.dockPadding;
		const targetWidth =
			iconGap * Object.keys(this.programs).length + this.dockPadding;

		this.width = Math.round(this.width + (targetWidth - this.width) / 5);

		let scale = 1.25;
		if (this.width > this.renderer.windowWidth) {
			scale = this.renderer.windowWidth / this.width;
		}

		// calculate positioning
		const dockLeft = (this.renderer.windowWidth - this.width * scale) / 2;
		const dockPadding = this.dockPadding * scale;
		let x = dockLeft + this.dockPadding * scale;
		let y =
			this.renderer.windowHeight - this.dockHeight * scale + dockPadding;

		// render back
		this.renderer.box(
			dockLeft,
			this.renderer.windowHeight - this.dockHeight * scale,
			this.width * scale,
			this.dockHeight * scale,
			{
				background:
					"rgba(var(--main-theme-primary-val), var(--main-theme-primary-val), var(--main-theme-primary-val), 0.25)",
				blur: 10,
				borderRadius: "10"
			}
		);

		const drawIcon = (directory: string, program: Program) => {
			const name = program.manifest.name;
			const icon = program.icon;

			const iconID = this.renderer.icon(
				x,
				y,
				icon,
				iconScale * scale,
				undefined,
				{ noProcess: true }
			);

			if (program.windows.length !== 0) {
				// the app is running.

				this.renderer.box(
					x + 0.5 * iconWidth,
					y + iconWidth + 10,
					5,
					5,
					{
						borderRadius: 100,
						background: "white"
					}
				);
			}

			let win: WindowAlias | undefined;
			if (program.windows.length == 1) {
				win = program.windows[0];
			}

			x += iconGap * scale;

			this.renderer.onClick(
				iconID,
				(left: number, top: number) => {
					if (win == undefined) {
						// check whether the app is even running at all
						if (program.windows.length == 0) {
							// start the app.
							this.env.exec(directory);
						} else {
							// show preview box of all the windows
							let contextMenuItems: Record<string, Function> = {};

							for (const i in program.windows) {
								const win = program.windows[i];

								contextMenuItems[
									`${win.iconName}-:-${win.name};${i}`
								] = () => {
									if (win.minimised) {
										win.unminimise();
									} else {
										win.minimise();
									}

									this.env.windows.focusWindow(win.winID);
								};
							}

							this.renderer.setContextMenu(
								left,
								top,
								`Windows of ${name}`,
								contextMenuItems
							);
						}
					} else {
						// just focus the one window we have.
						if (win.minimised) {
							win.unminimise();
						} else {
							win.minimise();
						}

						this.env.windows.focusWindow(win.winID);
					}

					this.refresh();
				},
				(left: number, top: number) => {
					// menu items
					let contextMenuItems: Record<string, Function> = {
						"folder-open-:-Show in Finder": () =>
							this.env.exec(
								"/System/CoreExecutables/Finder.appl",
								[this.env.fs.resolve(directory, "..")]
							)
					};

					if (win !== undefined) {
						contextMenuItems = {
							...contextMenuItems,
							"app-window-mac-:-New Window": () =>
								this.env.exec(directory),
							"minimize-2-:-Minimise": () => win.minimise(),
							"expand-:-Restore": () => win.unminimise(),
							"x-:-Close": () => win.close()
						};
					} else {
						if (program.windows.length == 0) {
							contextMenuItems = {
								...contextMenuItems,
								"app-window-mac-:-Open": () =>
									this.env.exec(directory)
							};
						} else {
							contextMenuItems = {
								...contextMenuItems,
								"app-window-mac-:-New Window": () =>
									this.env.exec(directory),
								"minimize-2-:-Minimise All": () => {
									for (const win of program.windows) {
										win.minimise();
									}
								},
								"expand-:-Restore All": () => {
									for (const win of program.windows) {
										win.unminimise();
									}
								},
								"x-:-Close All Windows": () => {
									for (const win of program.windows) {
										win.close();
									}
								}
							};
						}
					}

					contextMenuItems = {
						...contextMenuItems,
						"dock-:-Unpin From Dock": () => {}
					};

					// show menu
					this.renderer.setContextMenu(
						left,
						top,
						name,
						contextMenuItems
					);

					this.refresh();
				}
			);
		};

		for (const directory in this.programs) {
			drawIcon(directory, this.programs[directory]);
		}
	}
}
