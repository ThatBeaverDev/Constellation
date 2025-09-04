import * as conf from "../constellation.config.js";
import realFS, { FilesystemAPI } from "../io/fs.js";
import { appName } from "../runtime/runtime.js";
import { PermissionsError } from "../errors.js";
import {
	allWindows,
	focusedWindow,
	getWindowOfId,
	GraphicalWindow
} from "../windows/windows.js";
import { Framework, Process } from "../runtime/executables.js";
import Shell from "../lib/shell.js";
import { include } from "../runtime/importRewrites.js";
import {
	directoryPointType as directoryPoint,
	fsResponse,
	securityTimestamp,
	UserAlias,
	WindowAlias
} from "./definitions.js";
import Users, { User } from "./users.js";
import { debug, error, log, warn } from "../lib/logging.js";
import { FS, Stats } from "../io/browserfs.js";
import {
	DirectoryPermissionStats,
	Permission,
	Permissions
} from "./permissions.js";
import ConstellationKernel from "../main.js";

const start = performance.now();
const name = "/System/security/env.js";

const globalPermissionsHost = "/System/globalPermissionsHost.js";

securityTimestamp("Startup /src/security/env.ts", start);

export class EnvironmentCreator {
	associations: any = {};

	constructor(
		public filesystem: FilesystemAPI,
		public users: Users,
		public permissions: Permissions,
		public ConstellationKernel: ConstellationKernel
	) {}

	newEnv(
		directory: string,
		user: string,
		password: string,
		process?: Framework,
		isGlobal: boolean = false
	) {
		return new ApplicationAuthorisationAPI(
			this,
			directory,
			user,
			password,
			process,
			isGlobal
		);
	}
}

export class ApplicationAuthorisationAPI {
	#environmentCreator: EnvironmentCreator;

	constructor(
		environmentCreator: EnvironmentCreator,
		directory: string,
		user: string,
		password: string,
		process?: Framework,
		isGlobal: boolean = false
	) {
		const start = performance.now();

		this.#environmentCreator = environmentCreator;
		this.#isGlobal = isGlobal;

		this.#permissions =
			this.#environmentCreator.permissions.getDirectoryPermissions(
				directory
			);
		this.userID =
			this.#environmentCreator.users.usersStorage[
				this.#permissions.user
			]?.id;

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

		debug(
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
	readonly #isGlobal: boolean;

	#checkPermission(permission: Permission) {
		this.#environmentCreator.permissions.checkDirectoryPermission(
			this.directory,
			permission
		);
	}

	// shell
	shell: Shell;

	// logging
	debug(...content: any): undefined {
		const initiator = this.directory;
		if (initiator == globalPermissionsHost) {
			throw new Error(
				`globalEnv cannot be used to log. (${this.directory})`
			);
		}

		debug(initiator, ...content);
	}
	log(...content: any): undefined {
		const initiator = this.directory;
		if (initiator == globalPermissionsHost) {
			throw new Error(
				`globalEnv cannot be used to log. (${this.directory})`
			);
		}

		log(initiator, ...content);
	}
	warn(...content: any): undefined {
		const initiator = this.directory;
		if (initiator == globalPermissionsHost) {
			throw new Error(
				`globalEnv cannot be used to log. (${this.directory})`
			);
		}

		warn(initiator, ...content);
	}
	error(...content: any): undefined {
		const initiator = this.directory;
		if (initiator == globalPermissionsHost) {
			throw new Error(
				`globalEnv cannot be used to log. (${this.directory})`
			);
		}

		error(initiator, ...content);
	}

	/**
	 * Shows a graphical prompt onscreen
	 * @param text - the main statement
	 * @param reason - the description of this statement
	 */
	prompt(text: string, reason = "") {
		this.#environmentCreator.ConstellationKernel.runtime.showPrompt(
			"log",
			text,
			reason
		);
	}

	#directoryActionCheck(directory: string, isWriteOperation: boolean) {
		const domainType =
			this.#environmentCreator.permissions.getFilesDomainOfDirectory(
				directory,
				this.#user
			);
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
		createDirectory: async (
			directory: string
		): Promise<fsResponse<Error | true>> => {
			try {
				this.#directoryActionCheck(directory, true);

				await realFS.mkdir(directory);
				return { data: true, ok: true };
			} catch (error: any) {
				return {
					data: error,
					ok: false
				};
			}
		},
		listDirectory: async (
			directory: string = "/"
		): Promise<fsResponse<string[]>> => {
			try {
				this.#directoryActionCheck(directory, false);

				const list = await realFS.readdir(directory);
				return { data: list, ok: true };
			} catch (error: any) {
				return {
					data: error,
					ok: false
				};
			}
		},
		deleteDirectory: async (
			directory: string
		): Promise<fsResponse<true>> => {
			try {
				this.#directoryActionCheck(directory, true);

				let err: Error | undefined;
				await realFS.rmdir(directory);

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
			} catch (error: any) {
				return {
					data: error,
					ok: false
				};
			}
		},

		writeFile: async (
			directory: string,
			contents: string
		): Promise<fsResponse<true>> => {
			try {
				this.#directoryActionCheck(directory, true);

				await realFS.writeFile(directory, contents);
				return {
					data: true,
					ok: true
				};
			} catch (error: any) {
				return {
					data: error,
					ok: false
				};
			}
		},
		deleteFile: async (directory: string): Promise<fsResponse<true>> => {
			try {
				this.#directoryActionCheck(directory, true);

				await realFS.unlink(directory);
				return {
					data: true,
					ok: true
				};
			} catch (error: any) {
				return {
					data: error,
					ok: false
				};
			}
		},
		readFile: async (directory: string): Promise<fsResponse<string>> => {
			try {
				const content = await realFS.readFile(directory);

				if (content == undefined) {
					throw new Error(`File at ${directory} does not exist!`);
				}

				return {
					data: content,
					ok: true
				};
			} catch (error: any) {
				return {
					data: error,
					ok: false
				};
			}
		},
		move: async (
			oldDirectory: string,
			newDirectory: string
		): Promise<fsResponse<void>> => {
			try {
				return {
					data: await realFS.rename(oldDirectory, newDirectory),
					ok: true
				};
			} catch (error: any) {
				return {
					data: error,
					ok: false
				};
			}
		},

		stat: async (directory: string): Promise<fsResponse<Stats>> => {
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
			} catch (error: any) {
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
		/**
		 *
		 */
		resolve: realFS.resolve,
		relative: realFS.relative
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

	async include(directory: string): Promise<any> {
		let url = directory;

		this.#directoryActionCheck(directory, false);

		let type = directory.includes("://") ? "URL" : "directory";
		// @ts-expect-error
		if (conf.importOverrides[directory] !== undefined) {
			type = "URL";
			// @ts-expect-error
			url = conf.importOverrides[directory];
		}

		switch (type) {
			case "directory":
				return await include(directory);
			case "URL":
				const exports = await import(url.toString());

				return exports;
		}
	}

	exec = async (
		directory: string,
		args: any[] = [],
		user: string = String(this.#user),
		password: string = String(this.#password)
	) => {
		if (this.#isGlobal)
			throw new Error(
				"Global env cannot be used to start applications to insure applications are properly parented."
			);

		if (this.#process instanceof Process)
			return this.#environmentCreator.ConstellationKernel.runtime.execute(
				directory,
				args,
				user,
				password,
				this.#process
			);

		throw new Error("Framework may not execute processes.");
	};
	getPIDOfName(name: string): number | undefined {
		return this.#environmentCreator.associations[name];
	}

	/**
	 *
	 * @param directory - Target Directory
	 * @param permission
	 * @param value
	 */
	async setDirectoryPermission(
		directory: string,
		permission: Permission,
		value: boolean
	) {
		this.#environmentCreator.permissions.checkDirectoryPermission(
			this.directory,
			"managePermissions"
		);

		await this.#environmentCreator.permissions.setDirectoryPermission(
			directory,
			permission,
			value
		);
	}

	async hasPermission(permission: Permission) {
		try {
			// this will error if we don't have the permission
			this.#environmentCreator.permissions.checkDirectoryPermission(
				this.directory,
				permission
			);

			return true;
		} catch {}

		return false;
	}

	/**
	 * Provides the user a prompt to request a permission
	 * @param permission - the permission to request
	 * @returns Nothing - throws an error if the request is denied.
	 */
	async requestUserPermission(permission: Permission) {
		const start = performance.now();

		if (
			this.#environmentCreator.permissions.permissionsMetadata[permission]
				.requestable == false
		) {
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

		this.log("Permission by name " + permission + " requested.");
		const ok =
			await this.#environmentCreator.ConstellationKernel.runtime.showPrompt(
				"log",
				appname + " is requesting permission for " + permission,
				this.#environmentCreator.permissions.permissionsMetadata[
					permission
				].description,
				["Allow", "Deny"]
			);

		switch (ok) {
			case "Allow":
				await this.#environmentCreator.permissions.setDirectoryPermission(
					this.directory,
					permission,
					true
				);
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

			this.#environmentCreator.permissions.checkDirectoryPermission(
				this.directory,
				"windows"
			);

			const obj: WindowAlias[] = [];

			for (const win of allWindows()) {
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

			this.#environmentCreator.permissions.checkDirectoryPermission(
				this.directory,
				"windows"
			);

			const target = getWindowOfId(focusedWindow);

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

			this.#environmentCreator.permissions.checkDirectoryPermission(
				this.directory,
				"users"
			);

			const obj: Record<UserAlias["name"], UserAlias> = {};

			const users = this.#environmentCreator.users.usersStorage;
			for (const user in users) {
				const userData = users[user];

				obj[user] = this.#userToAlias(userData);
			}

			securityTimestamp(`Env ${this.directory} get all users`, start);

			return obj;
		},

		userInfo: (name: UserAlias["name"] = this.user) => {
			const start = performance.now();

			const userData = this.#environmentCreator.users.usersStorage[name];
			if (userData == undefined) return;

			const obj = this.#userToAlias(userData);
			securityTimestamp(`Env ${this.directory} get user info.`, start);

			return obj;
		},

		switch: async (user: string, password: string) => {
			const start = performance.now();

			let ok;
			try {
				ok = await this.#environmentCreator.users.validatePassword(
					user,
					password
				);
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
