import fs from "../io/fs.js";
import { defaultUser } from "./users.js";

export const permissionsDirectory = "/System/applicationPermissions.json";

export type Permission =
	| "windows"
	| "systemControl"
	| "containers"
	| "systemFiles"
	| "userFiles"
	| "customPermissions"
	| "network"
	| "audioPlayback"
	| "microphone"
	| "camera"
	| "managePermissions"
	| "operator";

export type DirectoryPermissionStats = Record<Permission, boolean> & {
	user: string;
};

export const permissionsMetadata: Record<
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
	customPermissions: {
		description:
			"Allows the application to create custom permissions and therefore popups for controlling other applications' access to data."
	},
	network: {
		description:
			"Allows the application to access the wider internet and therefore share data to malicious actors."
	},
	audioPlayback: {
		description: "Allows the application to play sound from your device."
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
	operator: {
		description:
			"Allows the application access to ALL permissions. This permission is NOT requestable.",
		requestable: false
	}
};

type PermissionsStore = Record<string, DirectoryPermissionStats>;

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
		camera: false,
		managePermissions: false,
		operator: false
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

export function getDirectoryPermission(
	directory: string,
	permission: Permission
) {
	{
		const perm = permissionsData[directory][permission];

		return perm;
	}
}
export async function setDirectoryPermission(
	directory: string,
	permission: Permission,
	value: boolean
) {
	let perm = permissionsData[directory];

	if (perm == undefined) {
		perm = createDefaultPermissions();
	}

	perm[permission] = value;
	console.log(perm, permissionsData);
	void (await onPermissionsUpdate());
}
export function checkDirectoryPermission(
	directory: string,
	permission: Permission
) {
	const val = getDirectoryPermission(directory, permission);

	return val == true;
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
