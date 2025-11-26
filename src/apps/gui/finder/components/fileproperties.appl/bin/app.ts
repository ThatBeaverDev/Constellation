import { pathIcon } from "pathinf";
import { Stats } from "../../../../../../fs/BrowserFsTypes.js";
import PanelKit from "panelkit";
import { bytesToSize } from "../../utils.js";
import { ApplicationAuthorisationAPI } from "../../../../../../system/security/env.js";

async function recursiveInfo(
	env: ApplicationAuthorisationAPI,
	directory: string
) {
	const directoryListing = await env.fs.listDirectory(directory);
	let size = 0;
	let childFiles = 0;

	for (const item of directoryListing) {
		const dir = env.fs.resolve(directory, item);

		childFiles++;

		const stats = await env.fs.stat(dir);
		const isDir = stats.isDirectory();

		if (isDir) {
			// folder
			try {
				const info = await recursiveInfo(env, dir);

				size += info.size;
				childFiles += info.childFiles;
			} catch (e) {}
		} else {
			// file
			const stats = await env.fs.stat(dir);
			size += stats.size;
		}
	}

	return { size, childFiles };
}

export default class FinderFileProperties extends GuiApplication {
	path: string = "/";
	filename: string = "root";
	stats?: Stats;
	info: {
		size: number;
		sizeBytes: string;
		isDirectory: boolean;
		created: Date;
		edited: Date;
		childFiles?: number;
		averageChildSizeBytes?: string;
	} = {
		size: 0,
		sizeBytes: "Loading",
		isDirectory: false,
		created: new Date(),
		edited: new Date()
	};
	icon: string = "folder";
	panelkit = new PanelKit(this.renderer);
	counter = 0;

	async init(args: any[]) {
		this.path = String(args[0]);
		this.filename = this.path.textAfterAll("/");
		if (this.filename == "") {
			this.filename = "Root";
		}

		this.renderer.windowName = "Properties";

		this.panelkit.sidebarWidth = 0;

		this.renderer.resizeWindow(300, 500);

		this.refresh();
	}

	async refresh() {
		this.icon = await pathIcon(this.env, this.path);
		this.renderer.setIcon(this.icon);

		this.stats = await this.env.fs.stat(this.path);
		const isDirectory = this.stats.isDirectory();

		let size: number;
		let childFiles: number | undefined;
		let averageChildSizeBytes: string | undefined;

		if (isDirectory) {
			const data = await recursiveInfo(this.env, this.path);

			size = data.size;
			childFiles = data.childFiles;

			const averageChildSize = size / childFiles;
			averageChildSizeBytes = bytesToSize(averageChildSize);
		} else {
			size = this.stats.size;
		}

		this.info = {
			size,
			sizeBytes: bytesToSize(size),
			isDirectory,
			created: this.stats.ctime,
			edited: this.stats.mtime,
			childFiles,
			averageChildSizeBytes
		};
	}

	frame() {
		if (this.counter++ % 2500 == 0) this.refresh();

		this.renderer.clear();
		this.panelkit.reset();

		const subtext = `${this.info.isDirectory ? "Folder" : "File"}, ${this.path}`;

		this.panelkit.mediumCard(this.filename, subtext, this.icon);

		// properties
		this.panelkit.card(`Size: ${this.info.sizeBytes}`, "box");

		if (this.info.childFiles) {
			if (this.info.averageChildSizeBytes) {
				this.panelkit.card(
					`Children: ${this.info.childFiles} (Avg: ${this.info.averageChildSizeBytes})`,
					"boxes"
				);
			} else {
				this.panelkit.card(
					`Children: ${this.info.childFiles}`,
					"boxes"
				);
			}
		}

		this.panelkit.card(
			`Created: ${this.info.created.toLocaleDateString()}, ${this.info.created.toLocaleTimeString()}`,
			this.info.isDirectory ? "folder-plus" : "file-plus"
		);

		if (!this.info.isDirectory) {
			this.panelkit.card(
				`Modified: ${this.info.edited.toLocaleDateString()}, ${this.info.edited.toLocaleTimeString()}`,
				"file-pen"
			);
		}

		this.renderer.commit();
	}
}
