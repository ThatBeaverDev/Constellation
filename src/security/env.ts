import * as conf from "../constellation.config.js";
import realFS from "../io/fs.js";
import { appName, execute, showPrompt } from "../apps/apps.js";
import { ImportError, PermissionsError } from "../errors.js";
import {
	focus,
	focusWindow,
	getWindowOfId,
	GraphicalWindow,
	windows
} from "../windows/windows.js";
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
import { include } from "../apps/appsImportReplacements.js";
import {
	directoryPointType as directoryPoint,
	fsResponse,
	securityTimestamp,
	UserAlias,
	WindowAlias
} from "./definitions.js";
import { User, users, validatePassword } from "./users.js";

const start = performance.now();
const name = "/System/security/env.js";

export const associations: any = {};

export class ApplicationAuthorisationAPI {
	constructor(
		directory: string,
		user: string,
		password: string,
		process?: Framework
	) {
		const start = performance.now();

		this.#permissions = getDirectoryPermissions(directory);
		this.userID = users[this.#permissions.user]?.id;

		if (this.userID == undefined) {
			throw new Error(
				`User ${user} either doesn't exist or users.js hasn't initialised properly.`
			);
		}

		this.shell = new Shell(directory, this);
		this.shell.index();

		this.directory = directory;
		this.#user = user;
		this.#password = password;
		this.#process = process;

		this.debug(
			name,
			`ApplicationAuthorisationAPI created as ${user} for ${directory}`
		);
		securityTimestamp(`Create env for ${directory}`, start);
	}

	readonly directory: string;
	readonly #permissions: DirectoryPermissionStats;
	readonly userID: string;
	#user: string;
	#password: string;
	get user() {
		return String(this.#user);
	}
	readonly #process?: Framework;

	#checkPermission(permission: Permission) {
		if (this.#permissions.operator !== true)
			if (this.#permissions[permission] !== true) {
				const userinfo = users[this.#user];

				if (userinfo.operator !== "true") {
					throw new PermissionsError(
						`Permission denied - permission ${permission} is not held by the actor file or actor file's user.`
					);
				}
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

	/**
	 * Shows a graphical prompt onscreen
	 * @param text - the main statement
	 * @param reason - the description of this statement
	 */
	prompt(text: string, reason = "") {
		showPrompt("log", text, reason);
	}

	#directoryActionCheck(directory: string, isWriteOperation: boolean) {
		const domainType = getFilesDomainOfDirectory(directory, this.#user);
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

	fs = {
		createDirectory: async (directory: string): Promise<fsResponse> => {
			try {
				this.#directoryActionCheck(directory, true);

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
				this.#directoryActionCheck(directory, false);

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
				this.#directoryActionCheck(directory, true);

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
				this.#directoryActionCheck(directory, true);

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
				this.#directoryActionCheck(directory, true);

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
				this.#directoryActionCheck(directory, false);

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
		typeOfFile: async (directory: string): Promise<directoryPoint> => {
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
		expectedType: directoryPoint
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

		this.#directoryActionCheck(location, false);

		let type = location.includes("://") ? "URL" : "directory";
		// @ts-expect-error
		if (conf.importOverrides[location] !== undefined) {
			type = "URL";
			// @ts-expect-error
			url = conf.importOverrides[location];
		}

		switch (type) {
			case "directory":
				return await include(location);
			case "URL":
				const exports = await import(url);

				return exports;
		}
	}

	exec = async (
		directory: string,
		args: any[] = [],
		user: string = String(this.#user),
		password: string = String(this.#password)
	) => {
		return execute(directory, args, user, password);
	};
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

	/**
	 * Provides the user a prompt to request a permission
	 * @param permission - the permission to request
	 * @returns Nothing - throws an error if the request is denied.
	 */
	async requestUserPermission(permission: Permission) {
		const start = performance.now();

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
		if (this.#process == undefined) {
			appname = this.directory;
		} else {
			appname = appName(this.#process);
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
					`Permission request for permission ${permission} denied.`
				);
		}

		securityTimestamp(
			`${this.directory} request permission ${permission} from user (${ok})`,
			start
		);
	}

	/**
	 *
	 * @param {GraphicalWindow} win - Window to create alias of
	 * @returns WindowAlias for the provided window
	 */
	#windowToAlias = (win: GraphicalWindow): WindowAlias => {
		const obj: WindowAlias = {
			move: win.move.bind(win),
			resize: win.resize.bind(win),
			close: win.remove.bind(win),

			minimise: win.minimise.bind(win),
			unminimise: win.unminimise.bind(win),
			minimised: win.minimised,

			fullscreen: win.fullscreen.bind(win),
			unfullscreen: win.unfullscreen.bind(win),
			fullscreened: win.fullscreened,

			show: win.show.bind(win),
			hide: win.hide.bind(win),

			showHeader: win.showHeader.bind(win),
			hideHeader: win.hideHeader.bind(win),

			name: win.name,
			shortName: win.shortname,
			iconName: win.iconName,
			applicationDirectory: win.Application.directory,

			position: win.position,
			dimensions: win.dimensions,

			winID: win.winID
		};

		return obj;
	};

	/**
	 *
	 * @param {User} user - User to create alias of
	 * @returns UserAlias for the provided user
	 */
	#userToAlias = (user: User): UserAlias => {
		const obj: UserAlias = {
			name: user.name,
			fullName: user.fullName,
			pictures: { profile: user.profilePicture },
			directory: user.directory,
			id: user.id,
			lastLogin: Number(user.lastLogin),
			allowGraphicalLogin: user.allowGraphicalLogin == "true"
		};

		return obj;
	};

	windows = {
		/**
		 * @returns an array for every window's WindowAlias
		 */
		all: (): WindowAlias[] => {
			const start = performance.now();

			checkDirectoryPermission(this.directory, "windows");

			const obj: WindowAlias[] = [];

			for (const win of windows) {
				const wn = this.#windowToAlias(win);

				obj.push(wn);
			}

			securityTimestamp(`Env ${this.directory} get all windows`, start);

			return obj;
		},
		/**
		 * @returns WindowAlias of the focused window
		 */
		getFocus: (): WindowAlias | undefined => {
			const start = performance.now();

			checkDirectoryPermission(this.directory, "windows");

			const target = getWindowOfId(focus);

			if (target == undefined) return undefined; // no window is focused

			const obj = this.#windowToAlias(target);

			securityTimestamp(`Env ${this.directory} get window focus`, start);

			return obj;
		}
	};

	/**
	 * Functions related to system users
	 */
	users = {
		/**
		 * @returns an array for every users's UserAlias
		 */
		all: () => {
			const start = performance.now();

			checkDirectoryPermission(this.directory, "users");

			const obj: Record<UserAlias["name"], UserAlias> = {};

			for (const user in users) {
				const userData = users[user];

				obj[user] = this.#userToAlias(userData);
			}

			securityTimestamp(`Env ${this.directory} get all users`, start);

			return obj;
		},

		userInfo: (name: UserAlias["name"]) => {
			const start = performance.now();

			const userData = users[name];

			if (userData == undefined) return;

			const obj = this.#userToAlias(userData);

			securityTimestamp(`Env ${this.directory} get user info.`, start);

			return obj;
		},

		switch: async (user: string, password: string) => {
			const start = performance.now();

			let ok;
			try {
				ok = await validatePassword(user, password);
			} catch (e) {
				securityTimestamp(
					`Env ${this.directory} switch user.`,
					start,
					"error"
				);
				return {
					ok: false,
					data: e
				};
			}

			if (ok) {
				this.#user = String(user);
			}

			securityTimestamp(`Env ${this.directory} switch user.`, start);

			return {
				ok: true,
				data: undefined
			};
		}
	};
}

securityTimestamp("Startup /src/security/env.ts", start);
