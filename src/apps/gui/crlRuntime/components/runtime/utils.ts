import {
	AstNode,
	RuntimeBlock,
	RuntimeBoolean,
	RuntimeCallable,
	RuntimeFunction,
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

		case "block":
		case "programFunction":
			result = runtimeValue.value;
			break;

		case "none":
			result = undefined;
			break;
		default:
			throw new Error(
				JSON.stringify(runtimeValue) +
					" is not valid and has no runtime value."
			);
	}

	return result;
}
