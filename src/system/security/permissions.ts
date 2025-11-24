import { PermissionsError } from "../errors.js";
import { FilesystemAPI } from "../../fs/fs.js";
import { defaultUser } from "./users.js";
import ConstellationKernel from "../kernel.js";

export const permissionsDirectory = "/System/applicationPermissions.json";

/**
 * A Permission for a process from the respective directory.
 */
export type Permission =
	| "windows"
	| "systemControl"
	| "containers"
	| "systemFiles"
	| "userFiles"
	| "users"
	| "processes"
	| "network"
	| "audioPlayback"
	| "microphone"
	| "camera"
	| "managePermissions"
	| "keylogger"
	| "operator";

/**
 * Permissions associated with the directory and the owner.
 */
export type DirectoryPermissionStats = Record<Permission, boolean> & {
	user: string;
};

export class ConstellationPermissionsManager {
	permissionsData: PermissionsStore = {};
	#ConstellationKernel: ConstellationKernel;

	constructor(
		public fs: FilesystemAPI,
		ConstellationKernel: ConstellationKernel
	) {
		this.#ConstellationKernel = ConstellationKernel;
	}

	async init() {
		// check if there's already a permissions file

		const permissionsFileExists =
			(await this.fs.stat(permissionsDirectory)) !== undefined;

		// if the permissions file exists, use it, else use {}
		const fileData = permissionsFileExists
			? JSON.parse((await this.fs.readFile(permissionsDirectory)) || "{}")
			: {};

		// put data into the permissions storage variable
		Object.assign(this.permissionsData, fileData);
	}

	createDefaultPermissions(): DirectoryPermissionStats {
		return structuredClone({
			user: defaultUser,
			windows: false,
			systemControl: false,
			containers: false,
			systemFiles: false,
			userFiles: false,
			users: false,
			processes: false,
			network: false,
			audioPlayback: false,
			microphone: false,
			camera: false,
			managePermissions: false,
			keylogger: false,
			operator: false
		});
	}

	getDirectoryPermissions(directory: string): DirectoryPermissionStats {
		const dir = String(directory);

		if (!this.permissionsData[dir]) {
			this.permissionsData[dir] = this.createDefaultPermissions();
			void this.onPermissionsUpdate();
		}
		return this.permissionsData[dir];
	}

	getDirectoryPermission(directory: string, permission: Permission) {
		const perms = this.getDirectoryPermissions(directory);

		return perms[permission];
	}

	async onPermissionsUpdate() {
		await this.fs.writeFile(
			permissionsDirectory,
			JSON.stringify(this.permissionsData)
		);
	}

	/**
	 * Sets the value of a permission on a directory.
	 * @param directory - Directory to modify permission on
	 * @param permission - Permission to modify
	 * @param value - Value to set the permission to
	 */
	async setDirectoryPermission(
		dir: string,
		permission: Permission,
		value: boolean
	) {
		const directory = String(dir);
		let perm = this.permissionsData[directory];

		if (perm == undefined) {
			perm = this.createDefaultPermissions();
		}

		perm[permission] = value;
		this.permissionsData[directory] = perm;

		await this.onPermissionsUpdate();
	}

	/**
	 * Throws an error if the permission is not true on a directory.
	 * @param directory - Directory to check permission on
	 * @param permission - the specific permission
	 */
	checkDirectoryPermission(
		directory: string,
		permission: Permission,
		user: string
	) {
		const val = this.getDirectoryPermission(directory, permission);

		if (val !== true || permission == "operator") {
			const userPermissions =
				this.#ConstellationKernel.security.users.getUser(user);

			const applicationIsOperator = this.getDirectoryPermission(
				directory,
				"operator"
			);
			const userIsOperator = userPermissions.operator == "true";

			if (!applicationIsOperator) {
				throw new PermissionsError(
					`Application at '${directory}' does not have permission '${permission}'`
				);
			}

			if (!userIsOperator) {
				throw new PermissionsError(
					`User ${user} does not have operator permissions.`
				);
			}
		}
	}

	getFilesDomainOfDirectory(
		directory: string,
		user: string,
		applicationDirectory: string
	): DirectoryDomain {
		let applicationDirectoryWithTrailingSlash =
			applicationDirectory[applicationDirectory.length - 1] == "/"
				? applicationDirectory
				: applicationDirectory + "/";

		if (
			(directory + "/").startsWith(applicationDirectoryWithTrailingSlash)
		) {
			return "local";
		}

		const rootPrefix = directory
			.split("/")
			.filter((item) => item !== "")[0];

		switch (rootPrefix) {
			case "Temporary":
			case "Applications":
				return "global";
			case "System":
				return "system";
			case "Users": {
				const username = directory
					.split("/")
					.filter((item) => item !== "")[1];

				if (username == undefined) return "global";

				if (username === user) {
					return "user";
				} else {
					return "private";
				}
			}
			default:
				return "global";
		}
	}

	permissionsMetadata: Record<
		Permission,
		{
			description: string;
			requestable?: boolean;
		}
	> = {
		windows: {
			description:
				"Allows the application to control how Constellation displays windows and collect data about open windows."
		},
		systemControl: {
			description:
				"Allows the application to to control Constellation through system APIs. DO NOT PROVIDE TO UNKNOWN APPS."
		},
		containers: {
			description:
				"Allows the application to run other applications within sandboxed environments"
		},
		systemFiles: {
			description:
				"Allows the application to edit system files, therefore possibly breaking or changing the behaviour of the system. DO NOT PROVIDE TO UNKNOWN APPS."
		},
		userFiles: {
			description:
				"Allow the application to edit and delete all user files. This means apps can delete ALL your files!"
		},
		users: {
			description:
				"Allows the application to view and edit users. DO NOT PROVIDE TO UNKNOWN APPS."
		},
		processes: {
			description:
				"Allows the application to view information about other processes and terminate these processes. DO NOT PROVIDE TO UNKNOWN APPS."
		},
		network: {
			description:
				"Allows the application to access the wider internet and therefore share data to malicious actors."
		},
		audioPlayback: {
			description:
				"Allows the application to play sound from your device."
		},
		microphone: {
			description:
				"Allows the application to access the microphone and therefore listen to you."
		},
		camera: {
			description:
				"Allows the application to access the camera and therefore see you."
		},
		managePermissions: {
			description:
				"Allows the application to edit other applications' or it's own permissions. DO NOT PROVIDE TO UNKNOWN APPS."
		},
		keylogger: {
			description:
				"Allows the application to recieve all keypresses regardless of whether has a window or is focused. DO NOT PROVIDE TO UNKNOWN APPS."
		},
		operator: {
			description:
				"Allows the application access to ALL permissions. This permission is NOT requestable.",
			requestable: false
		}
	};

	async terminate() {}
}

type PermissionsStore = Record<string, DirectoryPermissionStats>;

type DirectoryDomain = "system" | "user" | "global" | "local" | "private";
