import ConstellationKernel, { Terminatable } from "..//kernel.js";
import { EnvironmentCreator } from "./env.js";
import { Permissions } from "./permissions.js";
import Users from "./users.js";

export default class Security {
	env: EnvironmentCreator & Terminatable;
	permissions: Permissions & Terminatable;
	users: Users & Terminatable;

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

	async terminate() {
		await this.env.terminate();
		await this.permissions.terminate();
		await this.users.terminate();
	}
}
