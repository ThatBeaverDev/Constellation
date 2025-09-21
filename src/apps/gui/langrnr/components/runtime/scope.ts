import { RuntimeScope, RuntimeVariable } from "../definitions";

export class Scope implements RuntimeScope {
	variables: Map<string, RuntimeVariable> = new Map();
}
