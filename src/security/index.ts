import ConstellationKernel from "../kernel.js";
import { EnvironmentCreator } from "./env.js";
import { Permissions } from "./permissions.js";
import Users from "./users.js";

export default class Security {
	env: EnvironmentCreator;
	permissions: Permissions;
	users: Users;

	constructor(ConstellationKernel: ConstellationKernel) {
		const filesystem = ConstellationKernel.fs;

		this.users = new Users(ConstellationKernel);
		this.permissions = new Permissions(filesystem);
		this.env = new EnvironmentCreator(
			filesystem,
			this.users,
			this.permissions,
			ConstellationKernel
		);
	}

	async init() {
		this.users.init();
	}
}
