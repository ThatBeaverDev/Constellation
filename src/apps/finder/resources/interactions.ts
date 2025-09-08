import finder, { listing } from "../tcpsys/app.js";

export default class finderInteractions {
	renderer: finder["renderer"];
	env: finder["env"];
	parent: finder;

	constructor(parent: finder) {
		this.parent = parent;
		this.env = parent.env;
		this.renderer = parent.renderer;
	}

	showBodyContextMenu(clickX: number, clickY: number) {
		const context: Record<string, Function> = {};

		context["New Folder"] = async () => {
			let name = "New Folder";
			let path = this.env.fs.resolve(this.parent.path, name);

			await this.env.fs.createDirectory(path);

			this.parent.cd(this.parent.path);
		};

		this.renderer.setContextMenu(clickX, clickY, "Folder Actions", context);
	}

	openFile(directory: string) {
		if (this.parent.type == "picker") {
			// select and submit the file
			this.parent.pickerSubmit();
		} else {
			/* TODO: OPEN THE FILE! */
			this.env.prompt(
				"Functionality not implemented: opening files",
				"no current API for opening files in applications."
			);
		}
	}
	async openDirectory(directory: string) {
		await this.parent.cd(directory);
	}

	displayItemLeftClick(obj: listing, index: string) {
		return async () => {
			// left click
			if (this.parent.selector == Number(index)) {
				switch (obj.type) {
					case "directory":
						if (obj.path.endsWith(".appl")) {
							this.env.exec(obj.path);
							return;
						} else {
							await this.openDirectory(obj.path);
						}
						break;
					case "file":
						this.openFile(obj.path);

						break;
					default:
						throw new Error(
							"Unknown filetype cannot be handled for action: " +
								obj.type
						);
				}
			} else {
				this.parent.selector = Number(index);
			}
		};
	}

	displayItemRightClick(obj: listing) {
		return async (x: number, y: number) => {
			// right click

			const context: Record<string, Function> = {};

			switch (obj.type) {
				case "file":
					context["Open File"] = () => {
						this.openFile(obj.path);
					};
					break;
				case "directory":
					if (obj.path.endsWith(".appl")) {
						context["Show Contents"] = () => {
							this.openDirectory(obj.path);
						};
					} else {
						context["Open Directory"] = () => {
							this.openDirectory(obj.path);
						};
					}
					break;
			}

			context["Rename"] = () => {
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
				this.env.prompt("Functionality not implemented: copying files");
			};

			this.renderer.setContextMenu(x, y, obj.name, context);
		};
	}
}
