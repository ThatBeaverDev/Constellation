import { FilesystemAPI } from "../io/fs.js";
import ConstellationKernel from "../main.js";
import { EnvironmentCreator } from "./env.js";
import { Permissions } from "./permissions.js";
import Users from "./users.js";

export default class Security {
	env: EnvironmentCreator;
	permissions: Permissions;
	users: Users;

	constructor(public ConstellationKernel: ConstellationKernel) {
		const filesystem = ConstellationKernel.fs;

		this.users = new Users(filesystem);
		this.permissions = new Permissions(filesystem);
		this.env = new EnvironmentCreator(
			filesystem,
			this.users,
			this.permissions,
			this.ConstellationKernel
		);
	}

	async init() {
		this.users.init();
	}
}
