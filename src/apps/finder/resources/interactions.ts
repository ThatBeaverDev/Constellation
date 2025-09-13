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

	async reloadInterface() {
		await this.parent.cd(this.parent.path);
	}

	showBodyContextMenu() {
		const parentPath = this.parent.path;
		return (clickX: number, clickY: number) => {
			const context: Record<string, Function> = {};

			context["New Folder"] = async () => {
				let name = "New Folder";
				let path = this.env.fs.resolve(parentPath, name);

				await this.env.fs.createDirectory(path);

				this.reloadInterface();
			};

			this.renderer.setContextMenu(
				clickX,
				clickY,
				"Folder Actions",
				context
			);
		};
	}

	openFile(directory: string) {
		if (this.parent.type == "picker") {
			// select and submit the file
			this.parent.pickerSubmit();
		} else {
			/* TODO: OPEN THE FILE! */
			this.renderer.prompt(
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

			context["Rename"] = async () => {
				const newName = await this.renderer.askUserQuestion(
					"What should this file be called?",
					"This file's current name is " + obj.name,
					obj.icon
				);

				const oldPath = obj.path;
				const newPath = obj.path.textBeforeLast("/") + "/" + newName;

				const rename = await this.env.fs.move(oldPath, newPath);
				if (!rename.ok) {
					if (rename.data.name == "PermissionsError") {
						this.renderer.showUserPrompt(
							"Access Denied",
							"You cannot rename this file because you do not have permission to modify files in this directory.",
							"OK",
							undefined,
							obj.icon
						);
					}
				}
			};
			context["Move to Bin"] = async () => {
				const userInfo = this.env.users.userInfo(this.env.user);

				if (userInfo == undefined)
					throw new Error(
						"User that finder is running as supposedly doesn't exist."
					);

				const filename = btoa(
					JSON.stringify({
						originalPath: obj.path,
						deletionTime: Date(),
						deletionTimestamp: Date.now()
					})
				);

				const binpath = env.fs.resolve(
					userInfo.directory,
					"./recentlyDeleted"
				);
				const fileTargetPath = env.fs.resolve(binpath, filename);

				const moveResult = await this.env.fs.move(
					obj.path,
					fileTargetPath
				);
				if (!moveResult.ok) {
					throw moveResult.data;
				}

				this.reloadInterface();
			};
			context["Copy"] = async () => {
				//const oldPath = obj.path;
				//const newPath = await this.renderer.askUserDirectory(
				//	"Where do you want to copy this ${} to?",
				//	"This ${}}'s current location is " + obj.path,
				//	obj.icon
				//);
				//
				/* TODO: COPY THE FILE! */
				this.renderer.prompt(
					"Functionality not implemented: copying files"
				);
			};

			this.renderer.setContextMenu(x, y, obj.name, context);
		};
	}
}
