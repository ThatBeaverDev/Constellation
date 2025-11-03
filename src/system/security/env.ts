import { FilesystemAPI } from "../../fs/fs.js";
import { executionResult, ProcessInformation } from "../runtime/runtime.js";
import { appName } from "../runtime/components/appName.js";
import { PermissionsError } from "../errors.js";
import { Framework, Process } from "../runtime/components/executables.js";
import Shell from "../lib/shell.js";
import { securityTimestamp } from "./definitions.js";
import Users from "./users.js";
import {
	DirectoryPermissionStats,
	Permission,
	Permissions
} from "./permissions.js";
import ConstellationKernel from "..//kernel.js";
import EnvWindows from "./subsets/windows.js";
import EnvUsers from "./subsets/users.js";
import EnvFs from "./subsets/fs.js";
import EnvProcesses from "./subsets/processes.js";

const start = performance.now();
const name = "/System/security/env.js";

const globalPermissionsHost = "/System/globalPermissionsHost.js";

securityTimestamp("Startup /src/security/env.ts", start);

export class EnvironmentCreator {
	associations: any = {};
	filesystem: FilesystemAPI;
	users: Users;
	permissions: Permissions;
	#ConstellationKernel: ConstellationKernel;
	constructor(
		filesystem: FilesystemAPI,
		users: Users,
		permissions: Permissions,
		ConstellationKernel: ConstellationKernel
	) {
		this.filesystem = filesystem;
		this.users = users;
		this.permissions = permissions;
		this.#ConstellationKernel = ConstellationKernel;
	}

	newEnv(
		directory: string,
		user: string,
		password: string,
		process: Framework | undefined,
		processInfo: ProcessInformation | undefined,
		isGlobal: boolean = false
	) {
		return new ApplicationAuthorisationAPI(
			this.#ConstellationKernel,
			this,
			directory,
			user,
			password,
			process,
			processInfo,
			isGlobal
		);
	}

	async terminate() {}
}

export class ApplicationAuthorisationAPI {
	#environmentCreator: EnvironmentCreator;
	#ConstellationKernel: ConstellationKernel;

	constructor(
		ConstellationKernel: ConstellationKernel,
		environmentCreator: EnvironmentCreator,
		directory: string,
		user: string,
		password: string,
		process?: Framework,
		processInfo?: ProcessInformation,
		isGlobal: boolean = false
	) {
		const start = performance.now();

		this.#environmentCreator = environmentCreator;
		this.#ConstellationKernel = ConstellationKernel;
		this.#isGlobal = isGlobal;

		this.fs = new EnvFs(
			ConstellationKernel,
			this.#directoryActionCheck.bind(this)
		);

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

		this.processes = new EnvProcesses(
			ConstellationKernel,
			this.#checkPermission.bind(this)
		);

		if (ConstellationKernel.isGraphical) {
			this.windows = new EnvWindows(
				ConstellationKernel,
				this,
				this.#checkPermission.bind(this)
			);
		}

		this.users = new EnvUsers(
			this,
			environmentCreator,
			this.#checkPermission.bind(this),
			((user: string) => {
				this.#user = user;
			}).bind(this)
		);

		this.directory = directory;
		this.#user = user;
		this.#password = password;
		this.#process = process;
		this.#programInfo = processInfo;

		this.#ConstellationKernel.lib.logging.debug(
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
	#programInfo?: ProcessInformation;

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

		this.#ConstellationKernel.lib.logging.debug(
			initiator,
			content[0],
			...content.splice(1, Infinity)
		);
	}
	log(...content: any): undefined {
		const initiator = this.directory;
		if (initiator == globalPermissionsHost) {
			throw new Error(
				`globalEnv cannot be used to log. (${this.directory})`
			);
		}

		this.#ConstellationKernel.lib.logging.log(
			initiator,
			content[0],
			...content.splice(1, Infinity)
		);
	}
	warn(...content: any): undefined {
		const initiator = this.directory;
		if (initiator == globalPermissionsHost) {
			throw new Error(
				`globalEnv cannot be used to log. (${this.directory})`
			);
		}

		this.#ConstellationKernel.lib.logging.warn(
			initiator,
			content[0],
			...content.splice(1, Infinity)
		);
	}
	error(...content: any): undefined {
		const initiator = this.directory;
		if (initiator == globalPermissionsHost) {
			throw new Error(
				`globalEnv cannot be used to log. (${this.directory})`
			);
		}

		this.#ConstellationKernel.lib.logging.error(
			initiator,
			content[0],
			...content.splice(1, Infinity)
		);
	}

	#directoryActionCheck(
		directory: string,
		isWriteOperation: boolean
	): undefined | never {
		const domainType =
			this.#environmentCreator.permissions.getFilesDomainOfDirectory(
				directory,
				this.#user,
				this.directory
			);

		switch (domainType) {
			case "local":
			case "global":
				// all good
				break;
			case "user":
				// all ok IF we're only reading or have permission to write
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
			case "private":
				throw new PermissionsError(
					`Permission denied in action upon ${directory} - domain ${domainType}, isWriteOperation: ${isWriteOperation}`
				);
			default:
				throw new Error("Unknown domain: " + domainType);
		}
	}

	fs: EnvFs;

	async include(directory: string): Promise<any> {
		let url = directory;

		this.#directoryActionCheck(directory, false);

		let type = directory.includes("://") ? "URL" : "directory";

		switch (type) {
			case "directory":
				const blob =
					await this.#ConstellationKernel.runtime.importsRewriter.resolve(
						directory
					);

				return await import(blob);
			case "URL":
				const exports = await import(url.toString());

				return exports;
		}
	}

	/**
	 * Starts a program from a given directory to a `.appl` or `.backgr` package
	 * @param directory - Directory of the root of the application to execute from
	 * @param args - Arguements to be passed to the process
	 * @param user - Username to start this process with. Defaults to the parent process' user
	 * @param password - Password of the selected user. Defaults to the parent process' user's password
	 * @returns an Object containing a promise with the Process Waiting object - this promise will resolve when the process exits, and return the value the process exited with.
	 */
	async exec(
		directory: string,
		args: any[] = [],
		user: string = String(this.#user),
		password: string = String(this.#password)
	): Promise<executionResult> {
		if (this.#isGlobal)
			throw new Error(
				"Global env cannot be used to start applications to insure applications are properly parented."
			);

		if (this.#programInfo == undefined)
			throw new Error("No program info is present to execute with.");

		if (this.#process instanceof window.Process) {
			return this.#ConstellationKernel.runtime.execute(
				directory,
				args,
				user,
				password,
				this.#programInfo
			);
		}

		throw new Error("Framework may not execute processes.");
	}

	async terminate(process: Process) {
		const getInfo = (process: Process) => {
			const processes = this.#ConstellationKernel.runtime.processes;

			for (const child of processes) {
				if (child.kernel !== this.#ConstellationKernel) return;

				if (child.program == process) {
					return child;
				}
			}
		};

		const info = getInfo(process);
		if (info == undefined) throw new Error("This process doesn't exist!");

		const kill = async () => {
			await this.#ConstellationKernel.runtime.terminateProcess(process);
		};

		try {
			this.#checkPermission("systemControl");

			await kill();
		} catch {
			if (info.parent?.program == process) {
				await kill();
			} else {
				throw new Error(
					"This process must be a child to terminate it."
				);
			}
		}
	}

	getPIDOfName(name: string): number | undefined {
		return this.#environmentCreator.associations[name];
	}

	getKernel() {
		this.#checkPermission("operator");

		return this.#ConstellationKernel as ConstellationKernel;
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
		this.#checkPermission("managePermissions");

		await this.#environmentCreator.permissions.setDirectoryPermission(
			directory,
			permission,
			value
		);
	}

	hasPermission(permission: Permission) {
		try {
			// this will error if we don't have the permission
			this.#checkPermission(permission);

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
		const ok = await this.#ConstellationKernel.runtime.showPrompt(
			"log",
			appname + " is requesting permission for " + permission,
			this.#environmentCreator.permissions.permissionsMetadata[permission]
				.description,
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
	 * Functions related to the graphical window system.
	 */
	windows?: EnvWindows;

	/**
	 * Functions related to system users
	 */
	users: EnvUsers;

	processes: EnvProcesses;

	get systemType() {
		return this.#ConstellationKernel.ui.type == "GraphicalInterface"
			? "GUI"
			: "TUI";
	}
}
