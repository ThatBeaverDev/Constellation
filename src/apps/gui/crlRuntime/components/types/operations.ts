import { OperationReference } from "../config.js";
import { AstNode } from "../definitions.js";

// operation structure
export interface AstOperation {
	type: OperationReference;
	first: AstNode;
	second: AstNode;
}
