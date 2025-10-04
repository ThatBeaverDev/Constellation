import { ReassignmentReference } from "./config.js";
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
	| "operation"
	| "property";

export type AstNode<T = any> =
	| AstStringNode
	| AstNumberNode
	| AstBooleanNode
	| AstListNode<T>
	| AstDictNode
	| AstVariableNode
	| AstCallNode
	| AstBlockNode
	| AstOperationNode
	| AstPropertyReadoutNode
	| AstNoneNode;

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
	value: Map<AstNode, AstNode>;
}

export interface AstVariableNode {
	type: "var";
	value: string;
}

export interface AstCallNode {
	type: "code";
	value: AstGeneralDeclaration | AstFunctionCall | AstReassignent;
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
export interface AstPropertyReadoutNode {
	type: "getProperty";
	value: { target: AstNode; propertyName: AstNode };
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

// reassignment
export interface AstReassignent {
	type: "reassignment";
	name: string;
	reassignmentType: ReassignmentReference;
	value: AstNode;
}

// none
export interface AstNoneNode {
	type: "none";
	value: null;
}

export function removeBlanks(array: string[]): string[] {
	return array.filter((item) => !["", " ", "\t", "\n"].includes(item.trim()));
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
	value: null;
}

export interface RuntimeBlock {
	type: "block";
	value: AstNode[];
}

export type RuntimeCallable = (
	scope: RuntimeScope[],
	...args: RuntimeValue[]
) => RuntimeValue | Promise<RuntimeValue>;

interface RuntimeBaseFunction {
	type: "programFunction";
	isLazy: boolean;
	value: RuntimeCallable;
}
export interface RuntimeFunction extends RuntimeBaseFunction {
	isLazy: false;
}

export interface RuntimeList {
	type: "list";
	value: RuntimeValue[];
}

export interface RuntimeDict {
	type: "dict";
	value: Map<RuntimeValue, RuntimeValue>;
}

// lazy stuff
export interface RuntimeLazyFunction extends RuntimeBaseFunction {
	isLazy: true;
}
export interface RuntimeLazyValue {
	type: "lazyValue";
	value: { scopes: RuntimeScope[]; value: AstNode };
}

export type RuntimeValue =
	| RuntimeString
	| RuntimeNumber
	| RuntimeBoolean
	| RuntimeNone
	| RuntimeFunction
	| RuntimeBlock
	| RuntimeList
	| RuntimeDict
	| RuntimeLazyFunction
	| RuntimeLazyValue;
