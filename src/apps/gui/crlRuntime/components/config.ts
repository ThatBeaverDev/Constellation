export const operations = {
	// boolean
	"==": "isEqual",
	"!=": "isNotEqual",
	">": "greaterThan",
	">=": "greaterThanOrEqual",
	"<": "lessThan",
	"=<": "lessThanOrEqual",
	"&&": "and",
	"||": "or",

	// maths
	"+": "addition",
	"-": "subtraction",
	"/": "division",
	"*": "multiplication",
	"**": "exponent",
	"%": "remainder"
};

export type OperationType = keyof typeof operations;
export type OperationReference =
	| "isEqual"
	| "isNotEqual"
	| "greaterThan"
	| "greaterThanOrEqual"
	| "lessThan"
	| "lessThanOrEqual"
	| "and"
	| "or"
	| "addition"
	| "subtraction"
	| "division"
	| "multiplication"
	| "exponent"
	| "remainder";

// reassignment
export type ReassignmentType = keyof typeof reassignmentOperators;
export type ReassignmentReference =
	| "assign"
	| "add"
	| "minus"
	| "divide"
	| "multiply"
	| "exponent"
	| "remainder";
export const reassignmentOperators = {
	"=": "assign",
	"+=": "add",
	"-=": "minus",
	"/=": "divide",
	"*=": "multiply",
	"**=": "exponent",
	"%=": "remainder"
};
