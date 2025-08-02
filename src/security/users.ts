import fs from "../io/fs.js";
import { sha512 } from "../lib/crypto.js";
import { log } from "../lib/logging.js";
import { securityTimestamp } from "./definitions.js";
import { DirectoryPermissionStats } from "./permissions.js";

const start = performance.now();
const name = "/System/users.js";

export const usersDirectory = "/System/users.json";

export type User = {
	name: string;
	fullName: string;
	directory: string;
	password: string;
	profilePicture: string;
	id: string; // really it's this: `${number}-${string}-${string}-${string}-${string}-${string}` but typescript doesn't understand. (Date.now() plus a UUID.)
	lastLogin: string; // UNIX timestamp as number
	operator: string; // boolean
	allowGraphicalLogin: string; // boolean
};

export const users: Record<User["name"], User> = {};
export const defaultUser = "guest";

/**
 * Initialises the user system, such as loading users from the user file and creating guest and sys if needed
 */
export async function init() {
	// check if there's already a permissions file
	const permissionsFileExists = (await fs.stat(usersDirectory)) !== undefined;
	// if the permissions file exists, use it, else use {}
	const fileData = permissionsFileExists ? JSON.parse((await fs.readFile(usersDirectory)) || {}) : {};

	// put data into the permissions storage variable
	Object.assign(users, fileData);
}

/**
 * Updates the user file
 */
async function onUsersUpdate() {
	await fs.writeFile(usersDirectory, JSON.stringify(users));
}

/**
 * Returns a new user. Doesn't place it in the user list.
 * @param {string} username - the user's name
 * @param {string} password - the user's password
 * @returns A new user
 */
async function createUser(username: string, password: string): Promise<User> {
	return {
		name: username,
		fullName: username,
		directory: "/Users/" + username,
		password: await sha512(password),
		profilePicture: "circle-user-round",
		id: Number(Date.now()) + "-" + crypto.randomUUID(),
		lastLogin: String(Date.now()),
		operator: "false",
		allowGraphicalLogin: "false"
	};
}

export function listUsers(): string[] {
	return Object.keys(users);
}

export function getUser(username: string): User {
	if (users[username] == undefined) {
		throw new Error("User by name " + username + " does not exist.");
	}
	return users[username];
}

export function setUserKey(username: string, key: keyof User, value: string) {
	const usr = users[username];

	if (usr == undefined) {
		throw new Error(`User ${username} does not exist.`);
	}

	usr[key] = value;
	void onUsersUpdate();
}

export async function newUser(username: string, password: string, extraOptions?: Partial<Record<keyof User, string>>) {
	log(name, `Creating user by name ${username}.`);
	const user = await createUser(username, password);

	if (extraOptions !== undefined) {
		for (const i in extraOptions) {
			const key = i as keyof User;

			if (extraOptions[key] !== undefined) user[key] = extraOptions[key];
		}
	}

	users[username] = user;
	void (await onUsersUpdate());
}

export async function validatePassword(username: string, password: string) {
	const targetUser = users[username];

	if (targetUser == undefined) {
		throw new Error("User by name " + username + " does not exist.");
	}

	const targetPassword = targetUser.password;
	const passhash = await sha512(password);

	if (targetPassword == passhash) {
		// all good!
		return true;
	} else {
		// WRONG.
		throw new Error("Failure to change user: password is incorrect.");
	}
}

securityTimestamp("Startup /src/security/users.ts", start);
