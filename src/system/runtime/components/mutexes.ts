type pastMutexState = "free" | "abandoned";

type Mutex = { state: "active"; owner: number } | { state: "abandoned" };
type MutexRegistry = PartialRecord<string, Mutex>;

export class MutexManager {
	#mutexes: PartialRecord<string, MutexRegistry> = {};

	isMutexClaimed(name: string, scope: string) {
		const registry = this.#mutexes[scope];
		if (!registry) return false;

		const mutex = registry[name];
		if (!mutex || mutex.state == "abandoned") {
			return false;
		} else {
			return true;
		}
	}

	registerMutex(
		ownerPID: number,
		name: string,
		scope: string = "global"
	): pastMutexState {
		const isClaimed = this.isMutexClaimed(name, scope);

		if (isClaimed) {
			throw new Error("Mutex already in use.");
		} else {
			// claim it
			let registry = this.#mutexes[scope];
			if (!registry) {
				this.#mutexes[scope] = {};
				registry = {};
			}

			const mutex = registry[name];
			const oldState = mutex ? "abandoned" : "free";

			registry[name] = {
				state: "active",
				owner: ownerPID
			};

			return oldState;
		}
	}

	releaseMutex(ownerPID: number, name: string, scope: string = "global") {
		const registry = this.#mutexes[scope];
		if (!registry) {
			// doesn't exist anyway
			return;
		}

		if (!registry[name]) {
			// again, doesn't exist
			return;
		}

		if (registry[name]?.state == "active") {
			registry[name] = {
				state: "abandoned"
			};
		}
	}

	terminate(): Promise<void> | void {
		this.#mutexes = {};
	}
}
