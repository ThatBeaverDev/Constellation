import ConstellationKernel from "/System/kernel";
import { ApplicationAuthorisationAPI } from "/System/security/references";

export default class EnvMutexes {
	#ConstellationKernel: ConstellationKernel;
	#env: ApplicationAuthorisationAPI;
	#claimedMutexes: { name: string; isLocal: boolean }[] = [];
	#processPID: number;

	constructor(
		parent: ApplicationAuthorisationAPI,
		processPID: number,
		ConstellationKernel: ConstellationKernel
	) {
		this.#env = parent;
		this.#processPID = processPID;
		this.#ConstellationKernel = ConstellationKernel;
	}

	claimMutex(name: string, isLocal = false) {
		this.#claimedMutexes.push({ name, isLocal });

		this.#ConstellationKernel.runtime.Mutexes.registerMutex(
			this.#processPID,
			name,
			isLocal ? this.#env.user : "global"
		);
	}

	releaseMutex() {}
}
