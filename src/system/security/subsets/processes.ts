import ConstellationKernel from "../..//kernel.js";
import { ProcessInformation } from "../../runtime/runtime.js";
import { ProcessAlias } from "../definitions.js";
import { Permission } from "../permissions.js";

export default class EnvProcesses {
	#ConstellationKernel: ConstellationKernel;
	#checkPermission: (permission: Permission) => void;

	constructor(
		ConstellationKernel: ConstellationKernel,
		permissionCheck: (permission: Permission) => void
	) {
		this.#ConstellationKernel = ConstellationKernel;
		this.#checkPermission = permissionCheck;
	}

	#processToAlias(Program: ProcessInformation): ProcessAlias {
		const obj: ProcessAlias = {
			directory: Program.directory,
			args: Program.args,

			children: Program.children.map((child) =>
				this.#processToAlias(child)
			),
			kernelID: Program.kernel.id,

			id: Program.id,
			username: Program.user,
			startTime: Program.startTime,

			terminate: () => {
				this.#ConstellationKernel.runtime.terminateProcess(
					Program.program
				);
			}
		};

		return obj;
	}

	all(): ProcessAlias[] {
		this.#checkPermission("processes");

		return this.#ConstellationKernel.runtime.processes.map((process) =>
			this.#processToAlias(process)
		);
	}
}
