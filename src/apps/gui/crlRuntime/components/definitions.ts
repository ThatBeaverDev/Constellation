import { AstOperation } from "./types/operations.js";

// configuration
const libraryPaths = "/System/CoreLibraries/xlng";
libraryPaths;

// types
export type Ast = AstNode[];
export type AstTokenType =
	| "str"
	| "bool"
	| "num"
	| "list"
	| "dict"
	| "code"
	| "var"
	| "none"
	| "block"
	| "operation";

export type AstNode<T = any> =
	| AstStringNode
	| AstNumberNode
	| AstBooleanNode
	| AstListNode<T>
	| AstDictNode
	| AstVariableNode
	| AstCallNode
	| AstBlockNode
	| AstOperationNode;

// AST NODES
export interface AstStringNode {
	type: "str";
	value: string;
}

export interface AstNumberNode {
	type: "num";
	value: number;
}

export interface AstBooleanNode {
	type: "bool";
	value: boolean;
}

export interface AstListNode<T = any> {
	type: "list";
	value: T[];
}

export interface AstDictNode {
	type: "dict";
	value: Map<any, any>;
}

export interface AstVariableNode {
	type: "var";
	value: string;
}

export interface AstCallNode {
	type: "code";
	value: AstGeneralDeclaration | AstFunctionCall;
}

// general command body
interface AstFunctionCall {
	type: "functionCall";
	function: AstNode;
	args: AstNode[];
}

export interface AstBlockNode {
	type: "block";
	value: AstNode[];
}
export interface AstOperationNode {
	type: "operation";
	value: AstOperation;
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

// RUNTIME
export interface RuntimeScope {
	variables: Map<string, RuntimeVariable>;
}
export interface RuntimeVariable<T = RuntimeValue> {
	type: "constant" | "variable" | "global";
	value: T;
}

export interface RuntimeString {
	type: "string";
	value: string;
}
export interface RuntimeNumber {
	type: "number";
	value: number;
}
export interface RuntimeBoolean {
	type: "boolean";
	value: boolean;
}
export interface RuntimeNone {
	type: "none";
	value: undefined;
}

export interface RuntimeBlock {
	type: "block";
	value: AstNode[];
}

export type RuntimeCallable = (
	scope: RuntimeScope[],
	...args: RuntimeValue[]
) => RuntimeValue;
export interface RuntimeFunction {
	type: "programFunction";
	value: AstNode[] | RuntimeCallable;
}

export interface RuntimeList {
	type: "list";
	value: RuntimeValue[];
}

export type RuntimeValue =
	| RuntimeString
	| RuntimeNumber
	| RuntimeBoolean
	| RuntimeNone
	| RuntimeFunction
	| RuntimeBlock
	| RuntimeList;
