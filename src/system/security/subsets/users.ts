import { UserAlias } from "../definitions.js";
import { ApplicationAuthorisationAPI, EnvironmentCreator } from "../env.js";
import { Permission } from "../permissions.js";
import { User } from "../definitions.js";

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
			pictures: {
				profile: user.profilePicture,
				wallpaper: user.wallpaperPath
			},
			directory: user.directory,
			id: user.id,
			lastLogin: Number(user.lastLogin),

			allowGraphicalLogin: user.allowGraphicalLogin == "true",
			isOperator: user.operator == "true",

			changePassword: async (oldPassword, newPassword) => {
				await this.#environmentCreator.users.validatePassword(
					user.name,
					oldPassword
				);

				this.#environmentCreator.users.setUserKey(
					user.name,
					"password",
					newPassword
				);
			}
		};

		return obj;
	};

	/**
	 * @returns an array for every users's UserAlias
	 */
	all(): Record<UserAlias["name"], UserAlias> {
		this.#checkPermission("users");

		const obj: Record<UserAlias["name"], UserAlias> = {};

		const users = this.#environmentCreator.users.usersStorage;
		for (const user in users) {
			const userData = users[user];

			obj[user] = this.#userToAlias(userData);
		}

		return obj;
	}

	userInfo(name: UserAlias["name"] = this.#env.user) {
		if (name !== this.#env.user) {
			this.#checkPermission("users");
		}

		const userData = this.#environmentCreator.users.usersStorage[name];
		if (userData == undefined) return;

		const obj = this.#userToAlias(userData);

		return obj;
	}

	async switch(user: string, password: string) {
		let ok;
		try {
			ok = await this.#environmentCreator.users.validatePassword(
				user,
				password
			);
		} catch (e) {
			return {
				ok: false,
				data: e
			};
		}

		if (ok) {
			this.#setUser(String(user));
		}

		return {
			ok: true,
			data: undefined
		};
	}
}
