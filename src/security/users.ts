import fs from "../io/fs.js";
import { sha512 } from "../lib/crypto.js";

const name = "/System/users.js";

export const usersDirectory = "/System/users.json";

export type User = Record<UserStat, string | boolean>;

type Users = Record<string, User>;
type UserStat = "name" | "directory" | "password";

export const users: Users = {};
export const defaultUser = "guest";

export async function init() {
	// check if there's already a permissions file
	const permissionsFileExists = (await fs.stat(usersDirectory)) !== undefined;
	// if the permissions file exists, use it, else use {}
	const fileData = permissionsFileExists
		? JSON.parse((await fs.readFile(usersDirectory)) || {})
		: {};

	// put data into the permissions storage variable
	Object.assign(users, fileData);
	if (Object.keys(users).length == 0) {
		await newUser("guest", "");
		await newUser("sys", "admin1234");
	}
}

async function onUsersUpdate() {
	await fs.writeFile(usersDirectory, JSON.stringify(users));
}

async function createUser(username: string, password: string): Promise<User> {
	return {
		name: username,
		directory: "/Users/" + username,
		password: await sha512(password)
	};
}

export function listUsers(): string[] {
	return Object.keys(users);
}

export function getUser(username: string): User {
	if (!users[username]) {
		throw new Error("User by name " + username + " does not exist.");
	}
	return users[username];
}

export function setUserKey(
	username: string,
	key: UserStat,
	value: string | boolean
) {
	const usr = users[username];

	if (usr == undefined) {
		throw new Error(`User ${username} does not exist.`);
	}

	usr[key] = value;
	void onUsersUpdate();
}

export async function newUser(username: string, password: string) {
	env.log(name, `Creating user by name ${username}.`);
	users[username] = await createUser(username, password);
	void (await onUsersUpdate());
}
