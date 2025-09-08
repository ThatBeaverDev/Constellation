import { pathIcon } from "pathinf";
import { directoryPointType } from "../../../security/definitions";
import finderBody from "../resources/body.js";

const clamp = (n: number, min: number, max: number) => {
	if (n < min) {
		return min;
	}
	if (max < n) {
		return max;
	}

	return n;
};

export type listing = {
	name: string;
	path: string;
	icon: directoryPointType;
	type: string;
	subtext: string;
};

export default class finder extends Application {
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
	sidebarWidth: number = 100;

	// submodules
	body?: finderBody;

	async init() {
		const [
			initialDirectory = "/",
			mode = "app",
			recievingPipe,
			sendingPipe
		] = this.args;

		this.body = new finderBody(this);

		await this.cd(initialDirectory);
		this.type = mode;
		this.pipes = {
			recieve: recievingPipe,
			send: sendingPipe
		};

		this.renderer.setIcon("folder");
		this.renderer.setIcon(
			this.env.fs.resolve(this.directory, "./resources/icon.svg")
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
				this.cd(prompt("Select a directory") || ".");
				break;
		}
	}

	async cd(directory: string) {
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
			const path = this.env.fs.resolve(this.path, directory);

			const type = await this.env.fs.typeOfFile(path);

			const stat = await this.env.fs.stat(path);
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

			const hour = String(latestDate.getHours()).padStart(2, "0");
			const minute = String(latestDate.getMinutes()).padStart(2, "0");

			const lastModified = `${monthDay}/${month}/${year} at ${hour}:${minute}`;

			const obj: listing = {
				name: directory,
				path,
				icon: await pathIcon(path),
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
								const stat = await this.env.fs.stat(path);

								if (!stat.ok) throw stat.data;

								Math.round(stat.data.size / 102.4) / 10;
							})()} KiB, Last Modified ${lastModified}`
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

		const newIcon = await pathIcon(this.path);
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
					i;

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

		if (this.body == undefined) return;

		this.body.render();

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
