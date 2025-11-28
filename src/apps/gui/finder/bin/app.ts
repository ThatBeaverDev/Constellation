import { pathIcon } from "pathinf";
import { Stats } from "../../../../fs/BrowserFsTypes.js";
import PanelKit from "panelkit";
import { openFile } from "gui";
import { directoryPointType } from "../../../../system/security/definitions.js";
import { bytesToSize } from "../components/utils.js";

const clamp = (n: number, min: number, max: number) => {
	if (n < min) {
		return min;
	}
	if (max < n) {
		return max;
	}

	return n;
};

export interface listing {
	name: string;
	path: string;
	icon: string;
	type: directoryPointType;
	subtext: string;
	hasAccess?: boolean;
}

export default class finder extends GuiApplication {
	name: string = "Finder";

	path: string = "/";
	selector: number = 0;
	listing: listing[] = [];
	textDisplay?: string;
	location?: listing;
	icon: string = "folder";
	ok: boolean = false;
	sidebarWidth: number = 100;
	counter = 0;

	// submodules
	panelkit = new PanelKit(this.renderer);

	async init() {
		const [initialDirectory = "/"] = this.args;

		await this.cd(initialDirectory);

		this.renderer.setIcon(
			this.env.fs.resolve(this.directory, "./resources/icon.svg")
		);

		this.renderer.windowName = "Finder";
		this.renderer.windowShortName = "Finder";
	}

	async keydown(
		code: string,
		metaKey: boolean,
		altKey: boolean,
		ctrlKey: boolean,
		shiftKey: boolean,
		repeat: boolean
	) {
		switch (code) {
			case "ArrowDown":
				if (shiftKey) {
					this.selector = clamp(
						this.selector + 2,
						0,
						this.listing.length - 1
					);
				} else {
					this.selector = clamp(
						this.selector + 1,
						0,
						this.listing.length - 1
					);
				}
				break;
			case "ArrowUp":
				if (shiftKey) {
					this.selector = clamp(
						this.selector - 2,
						0,
						this.listing.length - 1
					);
				} else {
					this.selector = clamp(
						this.selector - 1,
						0,
						this.listing.length - 1
					);
				}
				break;
			case "Enter":
				const obj = this.listing[this.selector];
				this.cd(obj.path);
				this.selector = 0;
				break;
			case "Escape":
				this.selector = 0;
				this.cd("..");
				break;
			case "KeyG":
				// cd to user-provided directory
				const target = await this.renderer.askUserQuestion(
					"Go to Folder",
					"Enter a directory to view",
					this.env.fs.resolve(this.directory, "./resources/icon.svg")
				);

				this.cd(target == "" ? "." : target);
				break;
		}
	}

	async cd(directory: string) {
		this.ok = false;
		delete this.textDisplay;
		this.listing = [];

		const oldDir = String(this.path);
		if (oldDir !== directory) {
			this.selector = 0;
		}

		this.path = this.env.fs.resolve(this.path, directory);
		const dir = this.path;

		let directoryContents;
		try {
			directoryContents = await this.env.fs.listDirectory(dir);
		} catch (e: any) {
			if (e.constructor.name == "PermissionsError") {
				// this is just a no permissions case
				this.textDisplay = `You don't have permission to view '${this.path}'`;
				this.ok = true;
				return;
			}
			this.renderer.prompt(
				`Directory at ${this.path} doesn't exist.`,
				String(e)
			);

			this.path = oldDir;
			this.ok = true;
			return;
		}

		if (directoryContents == undefined) {
			this.renderer.prompt(`Directory at ${this.path} doesn't exist.`);
			this.path = oldDir;
			this.ok = true;
			return;
		}

		let list: string[] = directoryContents;

		// sort the list
		list.sort();

		// add the ascent button if possible (not at root)
		if (dir !== "/") {
			list = ["..", ...list];
		}

		const generateListing = async (
			directory: string
		): Promise<listing | undefined> => {
			const path = this.env.fs.resolve(this.path, directory);

			// get the type
			let type: directoryPointType;
			try {
				type = await this.env.fs.typeOfFile(path);
			} catch (e: unknown) {
				if (e?.constructor?.name == "PermissionsError") {
					// deal with it?
					type = "none";
				} else {
					throw e;
				}
			}

			let stat = await this.env.fs.stat(path);

			const lastModifiedDate: Date | undefined = stat.mtime;
			const creationDate: Date | undefined = stat.atime;

			let lastModified;
			if (lastModifiedDate == undefined || creationDate == undefined) {
				// one of them is bad, just leave it
				lastModified = "Insufficient Permissions";
			} else {
				const dates = [lastModifiedDate, creationDate];
				dates.sort();
				const latestDate = dates[1];

				const monthDay = latestDate.getDate();
				const month = latestDate.getMonth() + 1;
				const year = latestDate.getFullYear();

				const hour = String(latestDate.getHours()).padStart(2, "0");
				const minute = String(latestDate.getMinutes()).padStart(2, "0");

				lastModified = `${monthDay}/${month}/${year} at ${hour}:${minute}`;
			}

			const lastModifiedText =
				lastModified == "Insufficient Permissions"
					? ""
					: `, Last Modified ${lastModified}`;

			const getDirectorySubtext = async () => {
				let list: string[];
				try {
					list = await this.env.fs.listDirectory(path);
				} catch {
					return "Insufficient Permissions.";
				}

				return String(list.length) + " Items" + lastModifiedText;
			};

			const getFileSubtext = async () => {
				let stat: Stats;
				try {
					stat = await this.env.fs.stat(path);
				} catch {
					return "Insufficient Permissions.";
				}

				return bytesToSize(stat.size) + lastModifiedText;
			};

			const obj: listing = {
				name: directory,
				path,
				icon: await pathIcon(this.env, path),
				type,
				subtext:
					type == "directory"
						? await getDirectorySubtext()
						: await getFileSubtext()
			};

			if (type == "directory") {
				obj.hasAccess = obj.subtext == "Insufficient Permissions.";
			}

			return obj;
		};

		this.location = await generateListing(".");

		let listings: listing[] = [];
		for (const i in list) {
			const listing = await generateListing(list[i]);

			if (listing !== undefined) {
				listings.push(listing);
			}
		}

		this.listing = listings;

		const newIcon = await pathIcon(this.env, this.path);
		if (newIcon !== this.icon) {
			this.icon = newIcon;
		}

		this.ok = true;
	}

	isApplication(directory: string) {
		return directory.endsWith(".appl") || directory.endsWith(".srvc");
	}

	frame() {
		if (this.location == undefined) return;
		if (this.counter++ % 250 == 0) this.cd(this.path);

		// insure we are ready to render
		if (!this.ok) return;

		this.renderer.clear();

		// prevent drawing when the listing is blank
		if (this.listing == undefined) {
			return;
		}

		const panels = this.panelkit;

		// sidebar
		panels.sidebar(
			{ type: "title", text: "Important" },
			{
				type: "item",
				text: "Documents",
				icon: "file-stack",
				callback: () => {
					const userinf = this.env.users.userInfo(this.env.user);

					this.cd(
						this.env.fs.resolve(
							userinf?.directory || "/",
							"./Documents"
						)
					);
				}
			},
			{
				type: "item",
				text: "Desktop",
				icon: "dock",
				callback: () => {
					const userinf = this.env.users.userInfo(this.env.user);

					this.cd(
						this.env.fs.resolve(
							userinf?.directory || "/",
							"./Desktop"
						)
					);
				}
			},
			{
				type: "item",
				text: "Notes",
				icon: "notebook",
				callback: () => {
					const userinf = this.env.users.userInfo(this.env.user);

					this.cd(
						this.env.fs.resolve(
							userinf?.directory || "/",
							"./Notes"
						)
					);
				}
			},
			{
				type: "item",
				text: "Home",
				icon: "house",
				callback: () => {
					const userinf = this.env.users.userInfo(this.env.user);

					this.cd(userinf?.directory || "/");
				}
			}
		);

		// body
		panels.reset();

		const showPropertiesOfPath = (path: string) => {
			this.env.exec(
				this.env.fs.resolve("./components/fileproperties.appl"),
				[path]
			);
		};

		const RightClick = (directory: string) => {
			return (x: number, y: number) => {
				this.renderer.setContextMenu(x, y, undefined, {
					"Show Contents": this.isApplication(directory)
						? async () => {
								await this.cd(directory);
							}
						: undefined,
					Properties: () => showPropertiesOfPath(directory),
					Duplicate: async () => {
						await this.env.fs.copy(directory, `${directory} copy`);
						this.cd(this.path);
					},
					Rename: async () => {
						const newName = await this.renderer.askUserQuestion(
							"Rename Item",
							"What should this item by named?",
							"folder"
						);

						let parentFolder = directory.textBeforeLast("/");
						if (parentFolder == "") parentFolder = "/";

						const newDirectory = this.env.fs.resolve(
							parentFolder,
							newName
						);

						await this.env.fs.move(directory, newDirectory);
						this.cd(this.path);
					},
					Delete: async () => {
						const stats = await this.env.fs.stat(directory);

						if (stats.isDirectory()) {
							const walk = async (directory: string) => {
								const items =
									await this.env.fs.listDirectory(directory);

								for (const item of items) {
									const path = this.env.fs.resolve(
										directory,
										item
									);

									const stats = await this.env.fs.stat(path);

									if (stats.isDirectory()) {
										await walk(path);
									} else {
										await this.env.fs.deleteFile(path);
									}
								}

								await this.env.fs.deleteDirectory(directory);
							};

							await walk(directory);
						} else {
							await this.env.fs.deleteFile(directory);
						}

						this.cd(this.path);
					}
				});
			};
		};

		panels.mediumCard(
			`${this.location.path} - Current Location`,
			this.location.subtext,
			this.location.icon,
			undefined,
			RightClick(this.location.path),
			{
				type: "button",
				text: "Properties",
				onClick: () => {
					if (!this.location?.path) return;

					showPropertiesOfPath(this.location.path);
				}
			}
		);

		panels.title("Directory contents");

		this.listing.forEach((item) => {
			panels.mediumCard(
				item.name,
				item.subtext,
				item.icon,
				() => {
					this.openFile(item.path);
				},
				RightClick(item.path),
				{
					type: "button",
					text: "Properties",
					onClick: () => {
						showPropertiesOfPath(item.path);
					}
				}
			);
		});

		this.renderer.commit();
	}

	async openFile(path: string) {
		const stats = await this.env.fs.stat(path);

		const isDirectory = stats.isDirectory();

		if (isDirectory) {
			if (this.isApplication(path)) {
				this.env.exec(path);
			} else {
				await this.cd(path);
			}
		} else {
			openFile(this.env, path);
		}
	}
}
