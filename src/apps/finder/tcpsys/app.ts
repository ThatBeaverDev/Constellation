import { onClickOptions } from "../../../lib/uiKit/definitions";
import { IPCMessage } from "../../../runtime/messages";
import { directoryPointType } from "../../../security/definitions";

const clamp = (n: number, min: number, max: number) => {
	if (n < min) {
		return min;
	}
	if (max < n) {
		return max;
	}

	return n;
};

type listing = {
	name: string;
	path: string;
	icon: directoryPointType;
	type: string;
	subtext: string;
};

export default class finder extends Application {
	pathinf?: typeof import("../../../syslib/pathinf");

	name: string = "Finder";
	type: "picker" | "app" = "app";
	pipes!: {
		recieve: { intent: string; data: any }[];
		send: { intent: string; data: any }[];
	};
	path: string = "/";
	selector: number = 0;
	listing: listing[] = [];
	location?: listing;
	icon: string = "folder";
	ok: boolean = false;

	async init() {
		const [
			initialDirectory = "/",
			mode = "app",
			recievingPipe,
			sendingPipe
		] = this.args;

		this.pathinf = await this.env.include(
			"/System/CoreLibraries/pathinf.js"
		);
		await this.cd(initialDirectory);
		this.type = mode;
		this.pipes = {
			recieve: recievingPipe,
			send: sendingPipe
		};

		this.renderer.setIcon("folder");
		this.renderer.setIcon(
			env.fs.resolve(this.directory, "./resources/icon.svg")
		);

		setInterval(() => {
			this.cd(this.path);
		}, 500);

		this.ok = true;
	}

	keydown(
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
				// TODO: GRAPHICAL PROMPT
				// eslint-disable-next-line
				this.cd(prompt("Select a directory") || "");
				break;
		}
	}

	async cd(directory: string) {
		if (this.pathinf == undefined) return;
		this.ok = false;

		const oldDir = String(this.path);
		if (oldDir !== directory) {
			this.selector = 0;
		}

		this.path = this.env.fs.resolve(this.path, directory);
		const dir = this.path;

		const directoryContents = await this.env.fs.listDirectory(dir);
		if (!directoryContents.ok) {
			this.env.prompt(`Directory at ${this.path} doesn't exist.`);
			this.path = oldDir;
			return;
		}
		if (directoryContents.data == undefined) {
			this.env.prompt(`Directory at ${this.path} doesn't exist.`);
			this.path = oldDir;
			return;
		}

		let list: string[] = directoryContents.data;

		// sort the list
		list.sort();

		// add the ascent button if possible (not at root)
		if (dir !== "/") {
			list = ["..", ...list];
		}

		const generateListing = async (
			directory: string
		): Promise<listing | undefined> => {
			if (this.pathinf == undefined) return;

			const path = this.env.fs.resolve(this.path, directory);

			const type = await this.env.fs.typeOfFile(path);

			const stat = await env.fs.stat(path);
			if (!stat.ok) {
				throw stat.data;
			}

			const lastModifiedDate: Date = stat.data.mtime;
			const creationDate: Date = stat.data.atime;

			const dates = [lastModifiedDate, creationDate];
			dates.sort();
			const latestDate = dates[1];

			const monthDay = latestDate.getDate();
			const month = latestDate.getMonth() + 1;
			const year = latestDate.getFullYear();

			const hour = latestDate.getHours();
			const minute = latestDate.getMinutes();

			const lastModified = `${monthDay}/${month}/${year} at ${hour}:${minute}`;

			const obj: listing = {
				name: directory,
				path,
				icon: await this.pathinf.pathIcon(path),
				type,
				subtext:
					type == "directory"
						? `${await (async () => {
								const list =
									await this.env.fs.listDirectory(path);

								if (!list.ok) throw list.data;

								return list.data.length;
							})()} Items, Last Modified ${lastModified}`
						: `${await (async () => {
								const stat = await env.fs.stat(path);

								if (!stat.ok) throw stat.data;

								Math.round(stat.data.size / 102.4) / 10;
							})} KiB, Last Modified ${lastModified}`
			};

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

		const newIcon = await this.pathinf.pathIcon(this.path);
		if (newIcon !== this.icon) {
			this.icon = newIcon;
			this.renderer.setIcon(this.icon);
		}

		this.ok = true;
	}

	async frame() {
		// pipe messages (for picker)
		if (this.pipes !== undefined) {
			// only check this if we have a pipes value
			if (this.pipes.recieve !== undefined) {
				// loop through messages
				for (const i in this.pipes.recieve) {
					const item = this.pipes.recieve[0];
					if (typeof item !== "object") continue;

					this.pipes.recieve.splice(0, 1);
				}
			}
		}

		if (this.location == undefined) return;

		// if we're a picker, name ourselves so
		if (this.type == "picker") {
			this.renderer.windowName = "File Picker";
			this.renderer.windowShortName = "File Picker";
		} else {
			this.renderer.windowName = "Finder";
			this.renderer.windowShortName = "Finder";
		}

		// insure this.selector is defined
		if (this.selector == undefined) {
			this.selector = 0;
		}

		// insure we are ready to render
		if (!this.ok) return;

		this.renderer.clear();

		// prevent execution when the listing is blank
		if (this.listing == undefined) {
			return;
		}

		const iconScale = 2;
		const padding = 5;

		this.renderer.box(0, 0, 100, this.renderer.windowHeight + 100, {
			background: "var(--main-theme-secondary)"
		});

		// draw the folder name and icon at the top for the current location
		this.renderer.text(10, 10, "Important", 10);
		const usrinf = this.env.users.userInfo();
		if (usrinf == undefined) return;

		const homedir = usrinf.directory;
		const important: Record<string, string> = {
			Documents: env.fs.resolve(homedir, "./Documents"),
			Desktop: env.fs.resolve(homedir, "./Desktop"),
			Notes: env.fs.resolve(homedir, "./Notes"),
			Home: homedir
		};
		let y = 10 + 10 * 1.2;
		for (const name in important) {
			const icon = this.renderer.icon(10, y, "folder", 0.5);
			const text = this.renderer.text(25, y, name, 12);

			const onclick = () => {
				this.cd(important[name]);
			};

			this.renderer.onClick(icon, onclick);
			this.renderer.onClick(text, onclick);

			y += 10 + 12 * 1.2;
		}

		const displayItem = (
			x: number = 110,
			y: number = 10,
			icon: string = "/System/CoreAssets/Vectors/files/file.svg",
			name: string = "File",
			subtext: string = "Unknown",
			selected: boolean = false,
			leftClick: Function = () => {},
			rightClick: Function = () => {}
		) => {
			const iconScale = 1.4166666666;
			const width =
				39 +
				Math.max(
					this.renderer.getTextWidth(name),
					this.renderer.getTextWidth(subtext)
				) +
				padding * 2;
			const height = 34 + padding * 2;

			if (selected == true) {
				this.renderer.box(x, y, width, height, {
					background: "var(--main-accent-secondary)",
					borderRadius: 4
				});
			}

			const iconElem = this.renderer.icon(
				x + padding,
				y + padding,
				icon,
				iconScale
			);

			const titleElem = this.renderer.text(
				x + 39 + padding,
				y + 3 + padding,
				name
			);
			const subtextElem = this.renderer.text(
				x + 39 + padding,
				y + 20 + padding,
				subtext,
				10
			);

			const onClickConfig: onClickOptions = {
				scale: 1.1,
				origin: "left"
			};

			this.renderer.onClick(
				iconElem,
				leftClick,
				rightClick,
				onClickConfig
			);
			this.renderer.onClick(
				titleElem,
				leftClick,
				rightClick,
				onClickConfig
			);
			this.renderer.onClick(
				subtextElem,
				leftClick,
				rightClick,
				onClickConfig
			);

			return { width, height };
		};

		const dims = displayItem(
			undefined,
			undefined,
			this.location.icon,
			this.location.path + " - Current Location",
			this.location.subtext
		);

		const baseY = dims.height + 20 + 10;

		// draw the folder contents
		let x = 110;
		y = baseY;

		let maxWidth = 0;
		let height = 0;
		for (const i in this.listing) {
			const obj = this.listing[i];

			const openFile = () => {
				if (this.type == "picker") {
					// select and submit the file
					this.pickerSubmit();
				} else {
					/* TODO: OPEN THE FILE! */
					this.env.prompt(
						"Functionality not implemented: opening files",
						"no current API for opening files in applications."
					);
				}
			};
			const openDirectory = async () => {
				await this.cd(obj.path);
			};

			const leftClick = async () => {
				// left click
				if (this.selector == Number(i)) {
					switch (obj.type) {
						case "directory":
							if (obj.path.endsWith(".appl")) {
								this.env.exec(obj.path);
								return;
							} else {
								await openDirectory();
							}
							break;
						case "file":
							openFile();

							break;
						default:
							throw new Error(
								"Unknown filetype cannot be handled for action: " +
									obj.type
							);
					}
				} else {
					this.selector = Number(i);
				}
			};

			const rightClick = async (x: number, y: number) => {
				// right click

				const context: Record<string, Function> = {};

				switch (obj.type) {
					case "file":
						context["Open File"] = openFile.bind(this);
						break;
					case "directory":
						if (obj.path.endsWith(".appl")) {
							context["Show Contents"] = openDirectory.bind(this);
						} else {
							context["Open Directory"] =
								openDirectory.bind(this);
						}
						break;
				}

				context["Rename"] = () => {
					/* TODO: RENAME THE FILE! */
					this.env.prompt(
						"Functionality not implemented: renaming files"
					);
					/* TODO: RENAME THE FILE! */
					this.env.prompt(
						"Functionality not implemented: renaming files"
					);
				};
				context["Move to Bin"] = () => {
					/* TODO: MOVE THE FILE! */
					this.env.prompt(
						"Functionality not implemented: trashing files"
					);
				};
				context["Copy"] = () => {
					/* TODO: COPY THE FILE! */
					this.env.prompt(
						"Functionality not implemented: copying files"
					);
				};

				this.renderer.setContextMenu(x, y, obj.name, context);
			};

			const dims = displayItem(
				x,
				y,
				obj.icon,
				obj.name,
				obj.subtext,
				this.selector == Number(i),
				leftClick,
				rightClick
			);

			if (dims.width > maxWidth) {
				maxWidth = dims.width;
			}
			height = dims.height;

			y += 45;
			if (y + height > this.renderer.windowHeight) {
				// next row!
				y = baseY;
				x += maxWidth;
				maxWidth = 0;
			}
		}

		if (this.type == "picker") {
			// get the name
			const itemName = this.listing[this.selector].name;
			// get the path
			const path =
				itemName == ".."
					? this.path
					: this.env.fs.resolve(this.path, itemName);

			this.renderer.button(
				5,
				this.renderer.windowHeight - 50,
				"Select location (" + path + ")",
				this.pickerSubmit
			);
		}

		this.renderer.commit();
	}

	pickerSubmit() {
		const itemName = this.listing[this.selector].name;
		const path =
			itemName == ".."
				? this.path
				: this.env.fs.resolve(this.path, itemName);

		this.env.debug(
			this.name,
			"Submitting '" + path + "' for file picker result."
		);

		// send it to the caller and exit
		this.pipes.send.push({ intent: "selectionComplete", data: path });
		this.exit();
	}
}
