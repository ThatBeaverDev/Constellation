import fs from "../io/fs.js";
import { defaultUser } from "./users.js";

export const permissionsDirectory = "/System/applicationPermissions.json";

export type DirectoryPermissionStats = Record<Permission, boolean> & {
	user: string;
};

type PermissionsStore = Record<string, DirectoryPermissionStats>;
type Permission =
	| "windows"
	| "systemControl"
	| "containers"
	| "systemFiles"
	| "userFiles"
	| "customPermissions"
	| "network"
	| "audioPlayback"
	| "microphone"
	| "camera";
type DirectoryDomain = "system" | "user" | "global";

export const permissionsData: PermissionsStore = {};

// check if there's already a permissions file
const permissionsFileExists =
	(await fs.stat(permissionsDirectory)) !== undefined;
// if the permissions file exists, use it, else use {}
const fileData = permissionsFileExists
	? JSON.parse(await fs.readFile(permissionsDirectory))
	: {};

// put data into the permissions storage variable
Object.assign(permissionsData, fileData);

async function onPermissionsUpdate() {
	await fs.writeFile(permissionsDirectory, JSON.stringify(permissionsData));
}

function createDefaultPermissions(): DirectoryPermissionStats {
	return {
		user: defaultUser,
		windows: false,
		systemControl: false,
		containers: false,
		systemFiles: false,
		userFiles: false,
		customPermissions: false,
		network: false,
		audioPlayback: false,
		microphone: false,
		camera: false
	};
}

export function getDirectoryPermissions(
	directory: string
): DirectoryPermissionStats {
	if (!permissionsData[directory]) {
		permissionsData[directory] = createDefaultPermissions();
		void onPermissionsUpdate();
	}
	return permissionsData[directory];
}

export function setDirectoryPermission(
	directory: string,
	permission: Permission,
	value: boolean
) {
	const perm = permissionsData[directory];

	if (perm == undefined) {
		throw new Error(`Directory ${directory} has no permissions.`);
	}

	perm[permission] = value;
	void onPermissionsUpdate();
}

export function getFilesDomainOfDirectory(
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
