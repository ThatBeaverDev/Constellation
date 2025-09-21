import { RuntimeValue } from "../definitions.js";

export function unwrapValue(runtimeValue: RuntimeValue) {
	switch (runtimeValue.type) {
		case "string":
			return String(runtimeValue.value);
		case "boolean":
			return runtimeValue.value == true;
		case "number":
			return Number(runtimeValue.value);
		case "programFunction":
			return runtimeValue.value;
		case "none":
			return undefined;
	}
}
