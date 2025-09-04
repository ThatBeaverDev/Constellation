import { PermissionsError } from "../errors.js";
import fs, { FilesystemAPI } from "../io/fs.js";
import { securityTimestamp } from "./definitions.js";
import { defaultUser } from "./users.js";

const start = performance.now();

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

export class Permissions {
	permissionsData: PermissionsStore = {};

	constructor(public filesystem: FilesystemAPI) {}
	async init() {
		// check if there's already a permissions file
		const permissionsFileExists =
			(await fs.stat(permissionsDirectory)) !== undefined;
		// if the permissions file exists, use it, else use {}
		const fileData = permissionsFileExists
			? JSON.parse((await fs.readFile(permissionsDirectory)) || "{}")
			: {};

		// put data into the permissions storage variable
		Object.assign(this.permissionsData, fileData);
	}

	createDefaultPermissions(): DirectoryPermissionStats {
		return {
			user: defaultUser,
			windows: false,
			systemControl: false,
			containers: false,
			systemFiles: false,
			userFiles: false,
			users: false,
			network: false,
			audioPlayback: false,
			microphone: false,
			camera: false,
			managePermissions: false,
			keylogger: false,
			operator: false
		};
	}

	getDirectoryPermissions(directory: string): DirectoryPermissionStats {
		const dir = directory.toString();

		if (!this.permissionsData[dir]) {
			this.permissionsData[dir] = this.createDefaultPermissions();
			void this.onPermissionsUpdate();
		}
		return this.permissionsData[dir];
	}

	getDirectoryPermission(directory: string, permission: Permission) {
		{
			return this.permissionsData[directory.toString()][permission];
		}
	}

	async onPermissionsUpdate() {
		await fs.writeFile(
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
		directory: string,
		permission: Permission,
		value: boolean
	) {
		let perm = this.permissionsData[directory.toString()];

		if (perm == undefined) {
			perm = this.createDefaultPermissions();
		}

		perm[permission] = value;
		this.permissionsData[directory.toString()] = perm;

		void (await this.onPermissionsUpdate());
	}

	/**
	 * Throws an error if the permission is not true on a directory.
	 * @param directory - Directory to check permission on
	 * @param permission - the specific permission
	 */
	checkDirectoryPermission(directory: string, permission: Permission) {
		const val = this.getDirectoryPermission(directory, permission);

		if (val !== true) {
			const val = this.getDirectoryPermission(directory, "operator");

			if (val !== true) {
				throw new PermissionsError(
					`Application at '${directory}' does not have permission '${permission}'`
				);
			}
		}
	}

	getFilesDomainOfDirectory(
		directory: string,
		user: string
	): DirectoryDomain {
		const rootPrefix = directory.split("/")[0];

		switch (rootPrefix) {
			case "Temporary":
			case "Applications":
				return "global";
			case "System":
				return "system";
			case "Users": {
				const username = directory.split("/")[1];

				if (username === user) {
					return "user";
				} else {
					return "system";
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
}

type PermissionsStore = Record<string, DirectoryPermissionStats>;

type DirectoryDomain = "system" | "user" | "global";

securityTimestamp("Startup /src/security/permissions.ts", start);