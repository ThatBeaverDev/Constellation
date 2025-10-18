import { FilesystemAPI } from "../../fs/fs.js";
import { resolveDirectory } from "../io/fspath.js";
import ConstellationKernel from "..//kernel.js";
import { sha512 } from "../lib/crypto.js";
import { securityTimestamp } from "./definitions.js";

const start = performance.now();
const path = "/System/users.js";

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

export const defaultUser = "guest";

const usersParentFolder = "/Users";

export default class Users {
	usersStorage: Record<User["name"], User> = {};
	fs: FilesystemAPI;

	#ConstellationKernel: ConstellationKernel;
	constructor(ConstellationKernel: ConstellationKernel) {
		this.fs = ConstellationKernel.fs;
		this.#ConstellationKernel = ConstellationKernel;
	}

	/**
	 * Initialises the user system, such as loading users from the user file and creating guest and sys if needed
	 */
	async init() {
		this.#ConstellationKernel.lib.logging.debug(
			path,
			"Users initialising."
		);

		// check if there's already a permissions file
		const permissionsFileExists =
			(await this.fs.stat(usersDirectory)) !== undefined;
		// if the permissions file exists, use it, else use {}
		const fileData = permissionsFileExists
			? JSON.parse((await this.fs.readFile(usersDirectory)) || "{}")
			: {};

		// put data into the permissions storage variable
		Object.assign(this.usersStorage, fileData);

		this.#ConstellationKernel.lib.logging.debug(path, "Users initialised.");
	}

	/**
	 * Updates the user file
	 */
	async onUsersUpdate() {
		await this.fs.writeFile(
			usersDirectory,
			JSON.stringify(this.usersStorage)
		);
	}

	async validatePassword(username: string, password: string) {
		const targetUser = this.usersStorage[username];

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

	/**
	 * Returns a new user. Doesn't place it in the user list.
	 * @param {string} username - the user's name
	 * @param {string} password - the user's password
	 * @returns A new user
	 */
	async createUser(username: string, password: string): Promise<User> {
		return {
			name: username,
			fullName: username,
			directory: resolveDirectory(usersParentFolder, username),
			password: await sha512(password),
			profilePicture: "circle-user-round",
			id: Number(Date.now()) + "-" + crypto.randomUUID(),
			lastLogin: String(Date.now()),
			operator: "false",
			allowGraphicalLogin: "false"
		};
	}

	getUser(username: string): User {
		if (this.usersStorage[username] == undefined) {
			throw new Error("User by name " + username + " does not exist.");
		}
		return this.usersStorage[username];
	}

	setUserKey(username: string, key: keyof User, value: string) {
		const usr = this.usersStorage[username];

		if (usr == undefined) {
			throw new Error(`User ${username} does not exist.`);
		}

		usr[key] = value;
		void this.onUsersUpdate();
	}

	async newUser(
		username: string,
		password: string,
		extraOptions?: Partial<Record<keyof User, string>>
	) {
		this.#ConstellationKernel.lib.logging.log(
			path,
			`Creating user by name ${username}.`
		);
		const user = await this.createUser(username, password);

		if (extraOptions !== undefined) {
			for (const i in extraOptions) {
				const key = i as keyof User;

				if (extraOptions[key] !== undefined)
					user[key] = extraOptions[key];
			}
		}

		this.usersStorage[username] = user;

		// make the user's home folder
		await this.fs.mkdir(user.directory);

		for (const i in this.#ConstellationKernel.config.userDirectories) {
			// get absolute path
			const directory = this.fs.resolve(
				user.directory,
				this.#ConstellationKernel.config.userDirectories[i]
			);

			// create directory
			await this.fs.mkdir(directory);

			this.#ConstellationKernel.lib.logging.debug(
				path,
				`Created directory ${directory} for user ${username}`
			);
		}

		void (await this.onUsersUpdate());
	}

	async terminate() {}
}

securityTimestamp("Startup /src/security/users.ts", start);
