import { runTests } from "../../../../tests/libtest.js";
import { generateTokenAST } from "../components/ast/tokenAst.js";

const { logs } = await runTests([
	// string tokens
	{
		function: generateTokenAST,
		args: ['"hello"'],
		expectedResult: { type: "str", value: "hello" }
	},
	{
		function: generateTokenAST,
		args: ['""'],
		expectedResult: { type: "str", value: "" }
	},
	{
		function: generateTokenAST,
		args: ["`template`"],
		expectedResult: { type: "str", value: "template" }
	},
	{
		function: generateTokenAST,
		args: ["'single-quoted'"],
		expectedResult: { type: "str", value: "single-quoted" }
	},

	// boolean tokens
	{
		function: generateTokenAST,
		args: ["true"],
		expectedResult: { type: "bool", value: true }
	},
	{
		function: generateTokenAST,
		args: ["false"],
		expectedResult: { type: "bool", value: false }
	},

	// number tokens
	{
		function: generateTokenAST,
		args: ["42"],
		expectedResult: { type: "num", value: 42 }
	},
	{
		function: generateTokenAST,
		args: ["0xFF"],
		expectedResult: { type: "var", value: "0xFF" }
	},
	{
		function: generateTokenAST,
		args: ["1e3"],
		expectedResult: { type: "var", value: "1e3" }
	},

	// variables
	{
		function: generateTokenAST,
		args: ["myVar"],
		expectedResult: { type: "var", value: "myVar" }
	},

	// commands
	{
		function: generateTokenAST,
		args: ["echo()"],
		expectedResult: { type: "call", value: [] }
	},
	{
		function: generateTokenAST,
		args: ['log("Hello, world!")'],
		expectedResult: {
			type: "call",
			value: {
				type: "functionCall",
				name: "log",
				args: [{ type: "str", value: "Hello, world!" }]
			}
		}
	},

	// tricky ones
	{
		function: generateTokenAST,
		args: ['"42"'],
		expectedResult: { type: "str", value: "42" }
	},
	{
		function: generateTokenAST,
		args: ["'false'"],
		expectedResult: { type: "str", value: "false" }
	},

	{
		function: generateTokenAST,
		args: ["000123"],
		expectedResult: { type: "num", value: 123 }
	},
	{
		function: generateTokenAST,
		args: ["-0"],
		expectedResult: { type: "num", value: -0 }
	},
	{
		function: generateTokenAST,
		args: ["infinity"],
		expectedResult: { type: "num", value: Infinity }
	},
	{
		function: generateTokenAST,
		args: ["NaN"],
		expectedResult: { type: "var", value: "NaN" }
	},

	// Booleans hidden in other forms
	{
		function: generateTokenAST,
		args: ["TRUE"],
		expectedResult: { type: "call", value: "TRUE" }
	},
	{
		function: generateTokenAST,
		args: ["False"],
		expectedResult: { type: "call", value: "False" }
	},
	{
		function: generateTokenAST,
		args: ["truefalse"],
		expectedResult: {
			type: "call",
			value: { type: "functionCall", name: "truefalse", args: [] }
		}
	},

	// Strings with mismatched quotes
	{ function: generateTokenAST, args: ['"abc'], expectedResult: "none" },
	{ function: generateTokenAST, args: ["'abc\""], expectedResult: "none" },

	// Variables vs commands
	{
		function: generateTokenAST,
		args: ["_var123"],
		expectedResult: { type: "var", value: "_var123" }
	},
	{
		function: generateTokenAST,
		args: ["123abc"],
		expectedResult: { type: "var", value: "123abc" }
	},
	{ function: generateTokenAST, args: ["echo"], expectedResult: "none" },

	// List/dict stubs
	{
		function: generateTokenAST,
		args: ["[]"],
		expectedResult: { type: "list", value: [] }
	},
	{
		function: generateTokenAST,
		args: ["{}"],
		expectedResult: { type: "dict", value: new Map() }
	}
]);

console.log(logs);
