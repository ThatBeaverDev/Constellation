import * as conf from "../constellation.config.js";
import { blobifyDirectory } from "../lib/blobify.js";
import realFS from "../io/fs.js";
import { appName, execute, showPrompt } from "../apps/apps.js";
import { ImportError, PermissionsError } from "../errors.js";
import { windows } from "../windows/windows.js";
import {
	DirectoryPermissionStats,
	getDirectoryPermissions,
	getFilesDomainOfDirectory,
	Permission,
	setDirectoryPermission,
	permissionsMetadata,
	checkDirectoryPermission
} from "../security/permissions.js";
import { Framework, Process } from "../apps/executables.js";
import Shell from "../lib/shell.js";

const name = "/System/security/env.js";

// Types

type fsResponse = {
	data: any;
	ok: Boolean;
};

type directoryPointType =
	| "blockDevice"
	| "characterDevice"
	| "directory"
	| "FIFO"
	| "file"
	| "socket"
	| "symbolicLink"
	| "none";

export type windowAlias = {
	move: Function;
	resize: Function;
	close: Function;

	minimise: Function;
	unminimise: Function;
	minimised: boolean;

	show: Function;
	hide: Function;

	showHeader: Function;
	hideHeader: Function;

	name: string;
	iconName: string;
	winID: number;
	applicationDirectory: string;

	position: {
		left: number;
		top: number;
		zIndex: number;
	};
	dimensions: {
		width: number;
		height: number;
	};
};

export const associations: any = {};

export class ApplicationAuthorisationAPI {
	constructor(directory: string, user: string, process?: Framework) {
		this.#permissions = getDirectoryPermissions(directory);
		this.shell = new Shell(directory, this);
		this.shell.indexCommands();

		this.directory = directory;
		this.user = user;
		this.process = process;

		this.debug(
			name,
			`ApplicationAuthorisationAPI created as ${user} for ${directory}`
		);
	}

	readonly directory: string;
	readonly #permissions: DirectoryPermissionStats;
	readonly user: string;
	private readonly process?: Framework;

	#checkPermission(permission: Permission) {
		if (this.#permissions.operator == true)
			if (this.#permissions[permission] !== true) {
				throw new PermissionsError(
					`Permission denied - permission ${permission} is not held by the actor.`
				);
			}
	}

	// shell
	shell: Shell;

	// logging
	debug(initiator: string, ...content: any): undefined {
		console.debug("[" + initiator + "] -", ...content);
	}
	log(initiator: string, ...content: any): undefined {
		console.log("[" + initiator + "] -", ...content);
	}
	warn(initiator: string, ...content: any): undefined {
		console.warn("[" + initiator + "] -", ...content);
	}
	error(initiator: string, ...content: any): undefined {
		console.error("[" + initiator + "] -", ...content);
	}

	prompt(text: string, reason = "") {
		showPrompt("log", text, reason);
	}

	private _directoryActionCheck(
		directory: string,
		isWriteOperation: boolean
	) {
		const domainType = getFilesDomainOfDirectory(directory, this.user);
		switch (domainType) {
			case "global":
				// all good
				break;
			case "user":
				if (isWriteOperation && this.#permissions.userFiles == false) {
					throw new PermissionsError(
						`Permission denied in action upon ${directory} - domain ${domainType}, isWriteOperation: ${isWriteOperation}`
					);
				}
				break;
			case "system":
				if (
					isWriteOperation &&
					this.#permissions.systemFiles == false
				) {
					throw new PermissionsError(
						`Permission denied in action upon ${directory} - domain ${domainType}, isWriteOperation: ${isWriteOperation}`
					);
				}
				break;
		}
	}

	fs: any = {
		createDirectory: async (directory: string): Promise<fsResponse> => {
			try {
				this._directoryActionCheck(directory, true);

				await realFS.mkdir(directory);
				return { data: true, ok: true };
			} catch (error) {
				return {
					data: error,
					ok: false
				};
			}
		},
		listDirectory: async (directory: string = "/"): Promise<fsResponse> => {
			try {
				this._directoryActionCheck(directory, false);

				const list = await realFS.readdir(directory);
				return { data: list, ok: true };
			} catch (error) {
				return {
					data: error,
					ok: false
				};
			}
		},
		deleteDirectory: async (directory: string): Promise<fsResponse> => {
			try {
				this._directoryActionCheck(directory, true);

				let err: Error | undefined;
				await realFS.rmdir(directory, (e: Error) => {
					err = e;
				});

				if (err !== undefined && err !== null) {
					// @ts-expect-error
					switch (err.code) {
						case "ENOTEMPTY":
							throw new Error("Directory is not empty!");
						default:
							throw err;
					}
				}

				return {
					data: true,
					ok: true
				};
			} catch (error) {
				return {
					data: error,
					ok: false
				};
			}
		},

		writeFile: async (
			directory: string,
			contents: string
		): Promise<fsResponse> => {
			try {
				this._directoryActionCheck(directory, true);

				await realFS.writeFile(directory, contents);
				return {
					data: true,
					ok: true
				};
			} catch (error) {
				return {
					data: error,
					ok: false
				};
			}
		},
		deleteFile: async (directory: string): Promise<fsResponse> => {
			try {
				this._directoryActionCheck(directory, true);

				await realFS.unlink(directory);
				return {
					data: true,
					ok: true
				};
			} catch (error) {
				return {
					data: error,
					ok: false
				};
			}
		},
		readFile: async (directory: string): Promise<fsResponse> => {
			try {
				return {
					data: await realFS.readFile(directory),
					ok: true
				};
			} catch (error) {
				return {
					data: error,
					ok: false
				};
			}
		},
		move: async (
			oldDirectory: string,
			newDirectory: string
		): Promise<fsResponse> => {
			try {
				return {
					data: await realFS.rename(oldDirectory, newDirectory),
					ok: true
				};
			} catch (error) {
				return {
					data: error,
					ok: false
				};
			}
		},

		stat: async (directory: string): Promise<fsResponse> => {
			try {
				this._directoryActionCheck(directory, false);

				const stat = await realFS.stat(directory);

				if (stat == undefined) {
					throw new Error(
						directory + " has no file and cannot be 'statted'"
					);
				}

				return {
					data: stat,
					ok: true
				};
			} catch (error) {
				return {
					data: error,
					ok: false
				};
			}
		},
		typeOfFile: async (directory: string): Promise<directoryPointType> => {
			const stat = await this.fs.stat(directory);

			if (!stat.ok) {
				return "none";
			}

			const st = stat.data;

			const isBlockDevice = st.isBlockDevice();
			const isCharacterDevice = st.isCharacterDevice();
			const isDirectory = st.isDirectory();
			const isFIFO = st.isFIFO();
			const isFile = st.isFile();
			const isSocket = st.isSocket();
			const isSymbolicLink = st.isSymbolicLink();

			if (isBlockDevice) {
				return "blockDevice";
			}
			if (isCharacterDevice) {
				return "characterDevice";
			}
			if (isDirectory) {
				return "directory";
			}
			if (isFIFO) {
				return "FIFO";
			}
			if (isFile) {
				return "file";
			}
			if (isSocket) {
				return "socket";
			}
			if (isSymbolicLink) {
				return "symbolicLink";
			}

			return "none"; // no idea to be honest
		},
		resolve: (base: string, child: string): string => {
			return realFS.resolve(base, child);
		},
		relative: (from: string, to: string): string => {
			return realFS.relative(from, to);
		}
	};

	expectFileType = async (
		directory: string,
		expectedType: directoryPointType
	) => {
		const fileType = await this.fs.typeOfFile(directory);

		if (fileType !== expectedType) {
			throw new Error(
				"Filetype of " +
					directory +
					" (" +
					fileType +
					") does not match expected: " +
					expectedType
			);
		}
	};

	async include(location: string): Promise<any> {
		let url = location;

		this._directoryActionCheck(location, false);

		let type = location.includes("://") ? "URL" : "directory";
		// @ts-expect-error
		if (conf.importOverrides[location] !== undefined) {
			type = "URL";
			// @ts-expect-error
			url = conf.importOverrides[location];
		}

		switch (type) {
			case "directory":
				url = await blobifyDirectory(location, "text/javascript");
				break;
		}

		const exports = await import(url);

		return exports;
	}

	exec = execute;
	getPIDOfName(name: string): number | undefined {
		return associations[name];
	}

	async setDirectoryPermission(
		directory: string,
		permission: Permission,
		value: boolean
	) {
		this.#checkPermission("managePermissions");

		await setDirectoryPermission(directory, permission, value);
	}

	async requestUserPermission(permission: Permission) {
		if (permissionsMetadata[permission].requestable == false) {
			this.error(
				name,
				"Permission by name " +
					permission +
					" requested, which is not allowed."
			);
			throw new PermissionsError(
				`Permission '${permission}' is not requestable.`
			);
		}

		if (this.#permissions[permission] == true) return true;

		let appname;
		if (this.process == undefined) {
			appname = this.directory;
		} else {
			appname = appName(this.process);
		}

		this.log(name, "Permission by name " + permission + " requested.");
		const ok = await showPrompt(
			"log",
			appname + " is requesting permission for " + permission,
			permissionsMetadata[permission].description,
			["Allow", "Deny"]
		);

		switch (ok) {
			case "Allow":
				await setDirectoryPermission(this.directory, permission, true);
				this.#permissions[permission] = true;
				return true;
			case "Deny":
				throw new PermissionsError(
					"Permission request for permission " +
						permission +
						" denied."
				);
		}
	}

	allWindows(): windowAlias[] {
		checkDirectoryPermission(this.directory, "windows");

		const obj: windowAlias[] = [];

		for (const win of windows) {
			const wn: windowAlias = {
				move: win.move.bind(win),
				resize: win.resize.bind(win),
				close: win.remove.bind(win),

				minimise: win.minimise.bind(win),
				unminimise: win.unminimise.bind(win),
				minimised: win.minimised,

				show: win.show.bind(win),
				hide: win.hide.bind(win),

				showHeader: win.showHeader.bind(win),
				hideHeader: win.hideHeader.bind(win),

				name: win.name,
				iconName: win.iconName,
				applicationDirectory: win.Application.directory,

				position: win.position,
				dimensions: win.dimensions,

				winID: win.winID
			};

			obj.push(wn);
		}

		return obj;
	}
}

export const systemEnv = new ApplicationAuthorisationAPI("/System", "operator");
