import {
	AstDictNode,
	AstListNode,
	RuntimeDict,
	RuntimeList,
	RuntimeScope,
	RuntimeValue
} from "../../definitions.js";
import { CrlRuntime } from "../runtime.js";
import { unwrapValue } from "../utils.js";

export default class ObjectsRuntimeEvaluator {
	debug: typeof console.debug;
	constructor(public runtime: CrlRuntime) {
		this.debug = runtime.debug;
	}

	async evalList(scopes: RuntimeScope[], node: AstListNode) {
		const obj: RuntimeList = {
			type: "list",
			value: await Promise.all(
				node.value.map(
					async (item) => await this.runtime.evalNode(scopes, item)
				)
			)
		};

		return obj;
	}

	async evalDict(scopes: RuntimeScope[], node: AstDictNode) {
		const astMapping = node.value;
		const runtimeMapping: Map<RuntimeValue, RuntimeValue> = new Map();

		for (const [key, value] of astMapping) {
			const runtimeKey = await this.runtime.evalNode(scopes, key);
			const runtimeValue = await this.runtime.evalNode(scopes, value);

			runtimeMapping.set(
				unwrapValue(runtimeKey, this.debug),
				runtimeValue
			);
		}

		const obj: RuntimeDict = {
			type: "dict",
			value: runtimeMapping
		};

		return obj;
	}
}
