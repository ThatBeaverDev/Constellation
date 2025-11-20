import ConstellationKernel from "../../../../system/kernel";

export default class SoftwareUpdateInstaller extends Service {
	#ConstellationKernel?: ConstellationKernel;

	async init() {
		this.#ConstellationKernel = this.env.getKernel();

		const kernel = this.#ConstellationKernel;

		kernel.triggerUpdate();
	}
}
