import {
	AstNode,
	RuntimeBlock,
	RuntimeBoolean,
	RuntimeCallable,
	RuntimeDict,
	RuntimeFunction,
	RuntimeList,
	RuntimeNone,
	RuntimeNumber,
	RuntimeString,
	RuntimeValue
} from "../definitions.js";

export function unwrapValue(
	runtimeValue: RuntimeString,
	debug: typeof console.debug
): string;
export function unwrapValue(
	runtimeValue: RuntimeNumber,
	debug: typeof console.debug
): number;
export function unwrapValue(
	runtimeValue: RuntimeBoolean,
	debug: typeof console.debug
): boolean;
export function unwrapValue(
	runtimeValue: RuntimeFunction,
	debug: typeof console.debug
): RuntimeCallable | AstNode<any>[];
export function unwrapValue(
	runtimeValue: RuntimeBlock,
	debug: typeof console.debug
): AstNode[];
export function unwrapValue(
	runtimeValue: RuntimeNone,
	debug: typeof console.debug
): undefined;
export function unwrapValue(
	runtimeValue: RuntimeList,
	debug: typeof console.debug
): any[];
export function unwrapValue(
	runtimeValue: RuntimeDict,
	debug: typeof console.debug
): Map<RuntimeValue, RuntimeValue>;
export function unwrapValue(
	runtimeValue: RuntimeValue,
	debug: typeof console.debug
): any;
export function unwrapValue(
	runtimeValue: RuntimeValue,
	debug: typeof console.debug
): any {
	debug("Unwrapping", runtimeValue);

	let result: any;

	switch (runtimeValue?.type) {
		case "string":
			result = String(runtimeValue.value);
			break;

		case "number":
			result = Number(runtimeValue.value);
			break;

		case "boolean":
			result = runtimeValue.value == true;
			break;

		case "dict":
		case "block":
		case "programFunction":
			result = runtimeValue.value;
			break;

		case "list":
			result = runtimeValue.value.map((item) => unwrapValue(item, debug));
			break;

		case "none":
			result = null;
			break;
		default:
			throw new Error(
				`${JSON.stringify(runtimeValue)} is not valid and has no runtime value.')`
			);
	}

	debug("Unwrapped to", result);

	return result;
}

export function wrapValue(
	value: string | number | boolean | RuntimeCallable | undefined,
	debug: typeof console.debug
): RuntimeValue {
	debug("Wrapping", value);

	switch (typeof value) {
		case "string": {
			const obj: RuntimeString = {
				type: "string",
				value: String(value)
			};

			return obj;
		}

		case "number": {
			const obj: RuntimeNumber = {
				type: "number",
				value: value
			};

			return obj;
		}

		case "boolean": {
			const obj: RuntimeBoolean = {
				type: "boolean",
				value: value
			};

			return obj;
		}

		case "function": {
			const obj: RuntimeFunction = {
				type: "programFunction",
				value: value
			};

			return obj;
		}

		case "undefined": {
			const obj: RuntimeNone = {
				type: "none",
				value: null
			};

			return obj;
		}
		default:
			throw new Error(`Type ${typeof value} cannot be wrapped.`);
	}
}
