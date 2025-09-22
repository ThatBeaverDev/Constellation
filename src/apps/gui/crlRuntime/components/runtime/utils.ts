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

export function unwrapValue(runtimeValue: RuntimeString): string;
export function unwrapValue(runtimeValue: RuntimeNumber): number;
export function unwrapValue(runtimeValue: RuntimeBoolean): boolean;
export function unwrapValue(
	runtimeValue: RuntimeFunction
): RuntimeCallable | AstNode<any>[];
export function unwrapValue(runtimeValue: RuntimeBlock): AstNode[];
export function unwrapValue(runtimeValue: RuntimeNone): undefined;
export function unwrapValue(runtimeValue: RuntimeValue): any;
export function unwrapValue(runtimeValue: RuntimeValue): any {
	switch (runtimeValue.type) {
		case "string":
			return String(runtimeValue.value);

		case "number":
			return Number(runtimeValue.value);

		case "boolean":
			return runtimeValue.value == true;

		case "block":
		case "programFunction":
			return runtimeValue.value;

		case "none":
			return undefined;
	}
}
