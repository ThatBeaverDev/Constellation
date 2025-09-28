import { RuntimeScope, RuntimeVariable } from "../definitions";
import { CrlRuntime } from "./runtime";

export class Scope implements RuntimeScope {
	runtime: CrlRuntime;
	variables: Map<string, RuntimeVariable> = new Map();
	constructor(runtime: CrlRuntime, isDebug: boolean = false) {
		this.runtime = runtime;
	}
}
