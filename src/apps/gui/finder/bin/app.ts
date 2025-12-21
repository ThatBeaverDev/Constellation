import { pathIcon } from "pathinf";
import { Stats } from "../../../../fs/BrowserFsTypes.js";
import PanelKit from "panelkit";
import { openFile } from "gui";
import { directoryPointType } from "../../../../system/security/components/definitions.js";
import { bytesToSize } from "../components/utils.js";
import {
	archiveTypeSupported,
	getFilesystemInterface
} from "/System/CoreLibraries/archives.js";
import { FilesystemInterface } from "/System/security/components/env/components/fs.js";

export interface Listing {
	name: string;
	path: string;
	icon: string;
	type: directoryPointType;
	subtext: string;
	hasAccess?: boolean;
}

export default class Finder extends GuiApplication {
	name = "Finder";
	icon = "folder";

	path = "/";
	selector = 0;
	listing: Listing[] = [];
	location?: Listing;
	textDisplay?: string;
	ok = false;

	sidebarWidth = 100;
	counter = 0;

	panelkit = new PanelKit(this.renderer);

	currentFS?: FilesystemInterface;

	/* ───────────────────────────── Init ───────────────────────────── */

	async init() {
		const [initialDirectory = "/"] = this.args;

		await this.cd(initialDirectory, false);

		this.renderer.setIcon(
			this.env.fs.resolve(this.directory, "./resources/icon.svg")
		);

		this.renderer.windowName = "Finder";
		this.renderer.windowShortName = "Finder";
	}

	/* ───────────────────────────── Input ───────────────────────────── */

	async keydown(
		code: string,
		meta: boolean,
		alt: boolean,
		ctrl: boolean,
		shift: boolean,
		repeat: boolean
	) {
		this.panelkit.keydown(code, meta, alt, ctrl, shift, repeat);

		if (code === "Escape") {
			await this.cd("..", false);
			return;
		}

		if (code === "KeyG") {
			const target = await this.renderer.askUserQuestion(
				"Go to Folder",
				"Enter a directory to view",
				this.env.fs.resolve(this.directory, "./resources/icon.svg")
			);

			await this.cd(target || ".", false);
		}
	}

	/* ───────────────────────────── Navigation ───────────────────────────── */

	async cd(directory: string, isRefresh: boolean) {
		this.#resetState(isRefresh);

		const resolvedPath = this.env.fs.resolve(this.path, directory);

		if (this.currentFS == undefined || !isRefresh) {
			this.currentFS = await getFilesystemInterface(
				this.env.fs,
				resolvedPath
			);
		}
		const fs = this.currentFS;

		const oldPath = this.path;
		this.path = fs.resolve(this.path, directory);

		let contents: string[];
		try {
			contents = await fs.listDirectory(this.path);
		} catch (e: unknown) {
			this.#handleDirectoryError(e, oldPath);
			return;
		}

		if (!contents) {
			this.renderer.prompt(`Directory at ${this.path} doesn't exist.`);
			this.path = oldPath;
			this.ok = true;
			return;
		}

		this.location = await this.#generateListing(fs, ".");
		this.listing = await this.#buildListing(fs, contents);

		await this.#updateIcon(fs);
		this.ok = true;
	}

	#resetState(isRefresh: boolean) {
		this.ok = false;
		this.textDisplay = "";
		this.listing = [];

		if (!isRefresh) {
			this.panelkit.keyboardFocus = 0;
			this.selector = 0;
		}
	}

	#handleDirectoryError(error: unknown, fallback: string) {
		if (error?.constructor?.name === "PermissionsError") {
			this.textDisplay = `You don't have permission to view '${this.path}'`;
			this.ok = true;
			return;
		}

		this.renderer.prompt(
			`Directory at ${this.path} doesn't exist.`,
			String(error)
		);

		this.path = fallback;
		this.ok = true;
	}

	/* ───────────────────────────── Listings ───────────────────────────── */

	async #buildListing(
		fs: FilesystemInterface,
		contents: string[]
	): Promise<Listing[]> {
		const list = [...contents].sort();

		const results: Listing[] = [];

		if (this.path !== "/") {
			const parentFS = await getFilesystemInterface(
				this.env.fs,
				fs.resolve(this.path, "..")
			);

			const entry = await this.#generateListing(parentFS, "..");
			if (entry) results.push(entry);
		}

		for (const name of list) {
			const entry = await this.#generateListing(fs, name);
			if (entry) results.push(entry);
		}

		return results;
	}

	async #generateListing(
		fs: FilesystemInterface,
		name: string
	): Promise<Listing | undefined> {
		const path = fs.resolve(this.path, name);

		let type: directoryPointType = "none";
		try {
			type = await fs.typeOfFile(path);
		} catch (e: unknown) {
			if (e?.constructor?.name !== "PermissionsError") {
				throw e;
			}
		}

		const stat = await fs.stat(path);
		const lastModifiedText = this.#formatModified(stat);

		const subtext =
			type === "directory"
				? await this.#directorySubtext(fs, path, lastModifiedText)
				: await this.#fileSubtext(fs, path, lastModifiedText);

		let icon = "";
		try {
			icon = await pathIcon(fs, path);
		} catch (e) {
			this.env.warn(e);
		}

		return {
			name,
			path,
			type,
			icon,
			subtext,
			hasAccess:
				type === "directory" && subtext === "Insufficient Permissions."
		};
	}

	#formatModified(stat: Stats): string {
		if (!stat.mtime || !stat.atime) return "";

		const date = stat.mtime > stat.atime ? stat.mtime : stat.atime;

		const d = date.getDate();
		const m = date.getMonth() + 1;
		const y = date.getFullYear();
		const h = String(date.getHours()).padStart(2, "0");
		const min = String(date.getMinutes()).padStart(2, "0");

		return `, Last Modified ${d}/${m}/${y} at ${h}:${min}`;
	}

	async #directorySubtext(
		fs: FilesystemInterface,
		path: string,
		modified: string
	) {
		try {
			const list = await fs.listDirectory(path);
			return `${list.length} Items${modified}`;
		} catch {
			return "Insufficient Permissions.";
		}
	}

	async #fileSubtext(
		fs: FilesystemInterface,
		path: string,
		modified: string
	) {
		try {
			const stat = await fs.stat(path);
			return `${bytesToSize(stat.size)}${modified}`;
		} catch {
			return "Insufficient Permissions.";
		}
	}

	async #updateIcon(fs: FilesystemInterface) {
		try {
			const icon = await pathIcon(fs, this.path);
			if (icon !== this.icon) this.icon = icon;
		} catch (e) {
			this.env.warn(e);
		}
	}

	/* ───────────────────────────── Rendering ───────────────────────────── */

	frame() {
		if (!this.location || !this.ok) return;

		if (this.counter++ % 250 === 0) {
			this.cd(this.path, true);
			return;
		}

		this.renderer.clear();
		this.#renderSidebar();
		this.#renderContent();
		this.renderer.commit();
	}

	#renderSidebar() {
		const panels = this.panelkit;

		const user = this.env.users.userInfo(this.env.user);

		const jump = (dir: string) => {
			this.cd(this.env.fs.resolve(user?.directory || "/", dir), false);
		};

		const isFocused = (dir: string) => {
			return (
				this.env.fs.resolve(user?.directory || "/", dir) == this.path
			);
		};

		panels.sidebar(
			{ type: "title", text: "Important" },
			{
				type: "item",
				text: "Documents",
				icon: "file-stack",
				callback: () => jump("Documents"),
				focused: isFocused("Documents")
			},
			{
				type: "item",
				text: "Desktop",
				icon: "dock",
				callback: () => jump("Desktop"),
				focused: isFocused("Desktop")
			},
			{
				type: "item",
				text: "Notes",
				icon: "notebook",
				callback: () => jump("Notes"),
				focused: isFocused("Notes")
			},
			{
				type: "item",
				text: "Home",
				icon: "house",
				callback: () => jump("."),
				focused: isFocused(".")
			},

			{ type: "title", text: "Key Locations" },
			{
				type: "item",
				text: "Root",
				icon: "hard-drive",
				callback: () => jump("/"),
				focused: isFocused("/")
			},
			{
				type: "item",
				text: "Applications",
				icon: "square-function",
				callback: () => jump("/Applications"),
				focused: isFocused("/Applications")
			},
			{
				type: "item",
				text: "Users",
				icon: "users-round",
				callback: () => jump("/Users"),
				focused: isFocused("/Users")
			}
		);
	}

	#renderContent() {
		const panels = this.panelkit;

		panels.reset();

		const properties = (path: string) =>
			this.env.exec(
				this.env.fs.resolve("./components/fileproperties.appl"),
				[path]
			);

		const contextMenu = (path: string) => (x: number, y: number) =>
			this.renderer.setContextMenu(x, y, undefined, {
				"Show Contents": this.isApplication(path)
					? () => this.cd(path, false)
					: undefined,
				"Open With": () => {
					openFile(this.env, path, {
						forcePicker: true
					});
				},
				Properties: () => properties(path),
				Duplicate: async () => {
					await this.env.fs.copy(path, `${path} copy`);
					this.cd(this.path, false);
				},
				Rename: async () => {
					const name = await this.renderer.askUserQuestion(
						"Rename Item",
						"What should this item be named?",
						"folder"
					);

					if (!name) return;

					let parent = path.textBeforeLast("/") || "/";
					await this.env.fs.move(
						path,
						this.env.fs.resolve(parent, name)
					);

					this.cd(this.path, false);
				},
				Delete: async () => {
					await this.env.shell.exec("rm", path);
					this.cd(this.path, false);
				}
			});

		panels.mediumCard(
			`${this.location?.path ?? "/"} - Current Location`,
			this.location?.subtext ?? "",
			this.location?.icon ?? "",
			undefined,
			contextMenu(this.location?.path ?? ""),
			{
				type: "button",
				text: "Properties",
				onClick: () => properties(this.location!.path)
			}
		);

		panels.title("Directory contents");

		for (const item of this.listing) {
			panels.mediumCard(
				item.name,
				item.subtext,
				item.icon,
				() => this.openFile(item.path),
				contextMenu(item.path),
				{
					type: "button",
					text: "Properties",
					onClick: () => properties(item.path)
				}
			);
		}
	}

	/* ───────────────────────────── Utilities ───────────────────────────── */

	isApplication(path: string) {
		return path.endsWith(".appl") || path.endsWith(".srvc");
	}

	async openFile(path: string) {
		const fs = await getFilesystemInterface(this.env.fs, path);
		const stat = await fs.stat(path);

		const isDirectory = stat.isDirectory();
		const isSupportedArchive = await archiveTypeSupported(
			this.env.fs,
			path
		);

		if (isDirectory || isSupportedArchive) {
			this.isApplication(path)
				? this.env.exec(path)
				: this.cd(path, false);
			return;
		} else {
			openFile(this.env, path);
		}
	}
}
