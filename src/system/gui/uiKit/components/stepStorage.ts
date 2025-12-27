import { ConfigStep } from "../definitions";

type StepId = string | number;

export class StepStorage<T extends ConfigStep> {
	#steps = new Map<StepId, T>();
	#unchanged = new Map<StepId, T>();

	/* ---------- lifecycle ---------- */

	clear() {
		// snapshot current state
		this.#unchanged = new Map(this.#steps);
	}

	getUnchanged(): ReadonlyMap<StepId, T> {
		return this.#unchanged;
	}

	#markAssignment(id: StepId) {
		this.#unchanged.delete(id);
	}

	/* ---------- basic ops ---------- */

	get(id: StepId): T | undefined {
		return this.#steps.get(id);
	}

	set(id: StepId, value: T) {
		this.#markAssignment(id);
		this.#steps.set(id, value);
	}

	delete(id: StepId) {
		this.#markAssignment(id);
		this.#steps.delete(id);
	}

	has(id: StepId): boolean {
		return this.#steps.has(id);
	}

	/* ---------- iteration ---------- */

	entries(): IterableIterator<[StepId, T]> {
		return this.#steps.entries();
	}

	values(): IterableIterator<T> {
		return this.#steps.values();
	}

	keys(): IterableIterator<StepId> {
		return this.#steps.keys();
	}

	toArray(): T[] {
		return [...this.#steps.values()];
	}

	get size() {
		return this.#steps.size;
	}
}
