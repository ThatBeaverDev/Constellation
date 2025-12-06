import ConstellationKernel from "../..//kernel.js";
import { UiKitRendererClass } from "../../gui/uiKit/uiKit.js";
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

	#processToAlias(process: ProcessInformation): ProcessAlias {
		const obj: ProcessAlias = {
			directory: process.directory,
			args: process.args,

			children: process.children.map((child) =>
				this.#processToAlias(child)
			),
			kernelID: process.kernel.id,

			id: process.id,
			username: process.user,
			startTime: process.startTime,

			name:
				"renderer" in process.program &&
				process.program.renderer instanceof UiKitRendererClass
					? process.program.renderer.windowName
					: Object.getPrototypeOf(process.program).constructor.name,
			type:
				"renderer" in process.program &&
				process.program.renderer instanceof UiKitRendererClass
					? "application"
					: "service",

			terminate: () => {
				this.#ConstellationKernel.runtime.terminateProcess(
					process.program
				);
			}
		};

		if (
			"renderer" in process.program &&
			process.program.renderer instanceof UiKitRendererClass
		) {
			obj.icon = process.program.renderer.getIcon();
		}

		return obj;
	}

	all(): ProcessAlias[] {
		this.#checkPermission("processes");

		return this.#ConstellationKernel.runtime.processes.map((process) =>
			this.#processToAlias(process)
		);
	}
}
