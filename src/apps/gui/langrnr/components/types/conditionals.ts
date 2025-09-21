import { AstNode } from "../definitions.js";

// Conditional structure
export type AstConditional = AstIsEqual | AstLessThan | AstGreaterThan;
export interface AstIsEqual {
	type: "isEqual";
	first: AstNode;
	second: AstNode;
}
export interface AstLessThan {
	type: "lessThan";
	first: AstNode;
	second: AstNode;
}
export interface AstGreaterThan {
	type: "greaterThan";
	first: AstNode;
	second: AstNode;
}
