import { RuntimeScope, RuntimeVariable } from "../../definitions.js";
import { CrlRuntime } from "../runtime.js";

export class Scope implements RuntimeScope {
	runtime: CrlRuntime;
	variables: Map<string, RuntimeVariable> = new Map();
	constructor(runtime: CrlRuntime, isDebug: boolean = false) {
		this.runtime = runtime;
	}
}
