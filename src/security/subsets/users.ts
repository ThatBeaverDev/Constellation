import { securityTimestamp, UserAlias } from "../definitions.js";
import { ApplicationAuthorisationAPI, EnvironmentCreator } from "../env.js";
import { Permission } from "../permissions.js";
import { User } from "../users.js";

export default class EnvUsers {
	#env: ApplicationAuthorisationAPI;
	#environmentCreator: EnvironmentCreator;
	#checkPermission: (permission: Permission) => void;

	constructor(
		parent: ApplicationAuthorisationAPI,
		environmentCreator: EnvironmentCreator,
		permissionCheck: (permission: Permission) => void,
		setUser: (user: string) => void
	) {
		this.#env = parent;
		this.#environmentCreator = environmentCreator;
		this.#checkPermission = permissionCheck;
		this.#setUser = setUser;
	}

	#setUser: (user: string) => void;

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

	/**
	 * @returns an array for every users's UserAlias
	 */
	all(): Record<UserAlias["name"], UserAlias> {
		const start = performance.now();

		this.#checkPermission("users");

		const obj: Record<UserAlias["name"], UserAlias> = {};

		const users = this.#environmentCreator.users.usersStorage;
		for (const user in users) {
			const userData = users[user];

			obj[user] = this.#userToAlias(userData);
		}

		securityTimestamp(`Env ${this.#env.directory} get all users`, start);

		return obj;
	}

	userInfo(name: UserAlias["name"] = this.#env.user) {
		const start = performance.now();

		const userData = this.#environmentCreator.users.usersStorage[name];
		if (userData == undefined) return;

		const obj = this.#userToAlias(userData);
		securityTimestamp(`Env ${this.#env.directory} get user info.`, start);

		return obj;
	}

	async switch(user: string, password: string) {
		const start = performance.now();

		let ok;
		try {
			ok = await this.#environmentCreator.users.validatePassword(
				user,
				password
			);
		} catch (e) {
			securityTimestamp(
				`Env ${this.#env.directory} switch user.`,
				start,
				"error"
			);
			return {
				ok: false,
				data: e
			};
		}

		if (ok) {
			this.#setUser(String(user));
		}

		securityTimestamp(`Env ${this.#env.directory} switch user.`, start);

		return {
			ok: true,
			data: undefined
		};
	}
}
