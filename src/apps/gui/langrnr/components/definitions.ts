export type Ast = AstNode[];
export type AstTokenType =
	| "str"
	| "bool"
	| "num"
	| "list"
	| "dict"
	| "call"
	| "var"
	| "none";

export interface AstNode {
	type: AstTokenType;
	value: any;
}

// AST NODES
export interface AstStringNode extends AstNode {
	type: "str";
	value: string;
}

export interface AstNumberNode extends AstNode {
	type: "num";
	value: number;
}

export interface AstBooleanNode extends AstNode {
	type: "bool";
	value: boolean;
}

export interface AstListNode<T> extends AstNode {
	type: "list";
	value: T[];
}

export interface AstDictNode extends AstNode {
	type: "bool";
	value: Map<any, any>;
}

export interface AstVariableNode extends AstNode {
	type: "var";
	value: string;
}

export interface AstCallNode extends AstNode {
	type: "call";
	value: AstGeneralDeclaration | AstFunctionCall;
}

// general command body
interface AstFunctionCall {
	type: "functionCall";
	function: AstNode;
	args: AstNode[];
}

// Variable declarations
export interface AstGeneralDeclaration {
	type: "newConstant" | "newVariable" | "newGlobal";
	name: string;
	value: AstNode;
}

export interface AstConstantDeclaration extends AstGeneralDeclaration {
	type: "newConstant";
}
export interface AstVariableDeclaration extends AstGeneralDeclaration {
	type: "newVariable";
}
export interface AstGlobalDeclaration extends AstGeneralDeclaration {
	type: "newGlobal";
}

export function removeBlanks(array: string[]): string[] {
	return array.filter((item) => !["", " ", "\t", "\n"].includes(item));
}
