import { runTests } from "../../../../tests/libtest.js";
import { generateTokenAST } from "../components/ast/ast.js";

const debug = console.debug;

const { logs } = await runTests([
	// string tokens
	{
		function: generateTokenAST,
		args: ['"hello"', debug],
		expectedResult: { type: "str", value: "hello" }
	},
	{
		function: generateTokenAST,
		args: ['""', debug],
		expectedResult: { type: "str", value: "" }
	},
	{
		function: generateTokenAST,
		args: ["`template`", debug],
		expectedResult: { type: "str", value: "template" }
	},
	{
		function: generateTokenAST,
		args: ["'single-quoted'", debug],
		expectedResult: { type: "str", value: "single-quoted" }
	},

	// boolean tokens
	{
		function: generateTokenAST,
		args: ["true", debug],
		expectedResult: { type: "bool", value: true }
	},
	{
		function: generateTokenAST,
		args: ["false", debug],
		expectedResult: { type: "bool", value: false }
	},

	// number tokens
	{
		function: generateTokenAST,
		args: ["42", debug],
		expectedResult: { type: "num", value: 42 }
	},
	{
		function: generateTokenAST,
		args: ["0xFF", debug],
		expectedResult: { type: "var", value: "0xFF" }
	},
	{
		function: generateTokenAST,
		args: ["1e3", debug],
		expectedResult: { type: "var", value: "1e3" }
	},

	// variables
	{
		function: generateTokenAST,
		args: ["myVar", debug],
		expectedResult: { type: "var", value: "myVar" }
	},

	// commands
	{
		function: generateTokenAST,
		args: ["echo()", debug],
		expectedResult: {
			type: "code",
			value: {
				function: { type: "var", value: "echo" },
				type: "functionCall",
				args: []
			}
		}
	},
	{
		function: generateTokenAST,
		args: ['log("Hello, world!")', debug],
		expectedResult: {
			type: "code",
			value: {
				function: { type: "var", value: "log" },
				type: "functionCall",
				args: [{ type: "str", value: "Hello, world!" }]
			}
		}
	},

	// tricky ones
	{
		function: generateTokenAST,
		args: ['"42"', debug],
		expectedResult: { type: "str", value: "42" }
	},
	{
		function: generateTokenAST,
		args: ["'false'", debug],
		expectedResult: { type: "str", value: "false" }
	},

	{
		function: generateTokenAST,
		args: ["000123", debug],
		expectedResult: { type: "num", value: 123 }
	},
	{
		function: generateTokenAST,
		args: ["-0", debug],
		expectedResult: { type: "num", value: -0 }
	},
	{
		function: generateTokenAST,
		args: ["infinity", debug],
		expectedResult: { type: "num", value: Infinity }
	},
	{
		function: generateTokenAST,
		args: ["NaN", debug],
		expectedResult: { type: "var", value: "NaN" }
	},

	// Booleans hidden in other forms
	{
		function: generateTokenAST,
		args: ["TRUE", debug],
		expectedResult: { type: "var", value: "TRUE" }
	},
	{
		function: generateTokenAST,
		args: ["False", debug],
		expectedResult: { type: "var", value: "False" }
	},
	{
		function: generateTokenAST,
		args: ["truefalse", debug],
		expectedResult: {
			type: "var",
			value: "truefalse"
		}
	},

	// Strings with mismatched quotes
	{ function: generateTokenAST, args: ['"abc'], expectedResult: "none" },
	{ function: generateTokenAST, args: ["'abc\""], expectedResult: "none" },

	// Variables vs commands
	{
		function: generateTokenAST,
		args: ["_var123", debug],
		expectedResult: { type: "var", value: "_var123" }
	},
	{
		function: generateTokenAST,
		args: ["123abc", debug],
		expectedResult: { type: "var", value: "123abc" }
	},
	{
		function: generateTokenAST,
		args: ["echo", debug],
		expectedResult: { type: "var", value: "echo" }
	},

	// List/dict stubs
	{
		function: generateTokenAST,
		args: ["[]", debug],
		expectedResult: { type: "list", value: [] }
	},
	{
		function: generateTokenAST,
		args: ["#{}", debug],
		expectedResult: { type: "dict", value: new Map() }
	},
	{
		function: generateTokenAST,
		args: ['#{ greeting: "Hello", subject: "World" }', debug],
		expectedResult: { type: "dict", value: new Map() }
	},

	// conditions
	{
		function: generateTokenAST,
		args: ["7 == 5", debug],
		expectedResult: {
			type: "operation",
			value: {
				type: "isEqual",
				first: { type: "num", value: 7 },
				second: { type: "num", value: 5 }
			}
		}
	},
	{
		function: generateTokenAST,
		args: ["7 > 5", debug],
		expectedResult: {
			type: "operation",
			value: {
				type: "greaterThan",
				first: { type: "num", value: 7 },
				second: { type: "num", value: 5 }
			}
		}
	},
	{
		function: generateTokenAST,
		args: ["7 < 5", debug],
		expectedResult: {
			type: "operation",
			value: {
				type: "lessThan",
				first: { type: "num", value: 7 },
				second: { type: "num", value: 5 }
			}
		}
	},

	{
		function: generateTokenAST,
		args: ["if (3 > 5) {}", debug],
		expectedResult: {
			type: "code",
			value: {
				function: { type: "var", value: "if" },
				type: "functionCall",
				args: [
					{
						type: "operation",
						value: {
							type: "greaterThan",
							first: { type: "num", value: 3 },
							second: { type: "num", value: 5 }
						}
					},
					{
						type: "block",
						value: []
					}
				]
			}
		}
	},

	// multi-step operations
	{
		function: generateTokenAST,
		args: ['"Hello, " + name + "!"', debug],
		expectedResult: {
			type: "operation",
			value: {
				type: "addition",
				first: { type: "str", value: "Hello, " },
				second: {
					type: "operation",
					value: {
						type: "addition",
						first: { type: "var", value: "name" },
						second: { type: "str", value: "!" }
					}
				}
			}
		}
	},

	// --- Existing baseline cases (from you) ---
	// (keep all your original ones unchanged)

	// --- Extra tricky operations ---

	// Missing right-hand side of operation
	{
		function: generateTokenAST,
		args: ["7 +", debug],
		expectedResult: "none" // should throw: second operand missing
	},
	// Missing left-hand side of operation
	{
		function: generateTokenAST,
		args: ["+ 5", debug],
		expectedResult: "none"
	},
	// Unknown operation
	{
		function: generateTokenAST,
		args: ["3 %% 4", debug],
		expectedResult: "none" // should error: operation not valid
	},
	// Nested parentheses inside operations
	{
		function: generateTokenAST,
		args: ["(2 + 3) * 5", debug],
		expectedResult: {
			type: "operation",
			value: {
				type: "multiplication",
				first: {
					type: "operation",
					value: {
						type: "addition",
						first: { type: "num", value: 2 },
						second: { type: "num", value: 3 }
					}
				},
				second: { type: "num", value: 5 }
			}
		}
	},
	// Chain of operations without spacing (which is required)
	{
		function: generateTokenAST,
		args: ["1+2+3", debug],
		expectedResult: "none"
	},
	// String concatenation chain with mixed spaces (should break)
	{
		function: generateTokenAST,
		args: ['"a"+"b" + "c"', debug],
		expectedResult: "none"
	},
	// Boolean operations
	{
		function: generateTokenAST,
		args: ["true && false", debug],
		expectedResult: {
			type: "operation",
			value: {
				type: "and",
				first: { type: "bool", value: true },
				second: { type: "bool", value: false }
			}
		}
	},
	{
		function: generateTokenAST,
		args: ["true || false", debug],
		expectedResult: {
			type: "operation",
			value: {
				type: "or",
				first: { type: "bool", value: true },
				second: { type: "bool", value: false }
			}
		}
	},
	// Unary minus (edge case: not currently handled by your code)
	{
		function: generateTokenAST,
		args: ["-5", debug],
		expectedResult: { type: "num", value: -5 }
	},
	// Double equals inside variable name (should NOT be parsed as op)
	{
		function: generateTokenAST,
		args: ["foo==bar", debug],
		expectedResult: "none"
	},

	// --- Nested tricky mixed ops ---
	// Multiple chained arithmetic ops
	{
		function: generateTokenAST,
		args: ["1 + 2 * 3", debug],
		expectedResult: {
			type: "operation",
			value: {
				type: "addition",
				first: { type: "num", value: 1 },
				second: {
					type: "operation",
					value: {
						type: "multiplication",
						first: { type: "num", value: 2 },
						second: { type: "num", value: 3 }
					}
				}
			}
		}
	},
	// Nested with booleans and arithmetic
	{
		function: generateTokenAST,
		args: ["(1 + 2) > (2 * 3)", debug],
		expectedResult: {
			type: "operation",
			value: {
				type: "greaterThan",
				first: {
					type: "operation",
					value: {
						type: "addition",
						first: { type: "num", value: 1 },
						second: { type: "num", value: 2 }
					}
				},
				second: {
					type: "operation",
					value: {
						type: "multiplication",
						first: { type: "num", value: 2 },
						second: { type: "num", value: 3 }
					}
				}
			}
		}
	},

	// --- Totally malformed cases ---
	{ function: generateTokenAST, args: [""], expectedResult: "none" },
	{ function: generateTokenAST, args: ["   "], expectedResult: "none" },
	{ function: generateTokenAST, args: ["()"], expectedResult: "none" },
	{ function: generateTokenAST, args: ["=="], expectedResult: "none" },

	// property reading
	{
		function: generateTokenAST,
		args: ["foo.bar", debug],
		expectedResult: {
			type: "getProperty",
			value: {
				target: { type: "var", value: "foo" },
				propertyName: { type: "str", value: "bar" }
			}
		}
	},
	{
		function: generateTokenAST,
		args: ["foo.bar.baz", debug],
		expectedResult: {
			type: "getProperty",
			value: {
				target: {
					type: "getProperty",
					value: {
						target: { type: "var", value: "foo" },
						propertyName: { type: "str", value: "bar" }
					}
				},
				propertyName: { type: "str", value: "baz" }
			}
		}
	},
	{
		function: generateTokenAST,
		args: ['foo.bar("baz")', debug],
		expectedResult: {
			type: "code",
			value: {
				function: {
					type: "getProperty",
					value: {
						target: { type: "var", value: "foo" },
						propertyName: { type: "str", value: "bar" }
					}
				},
				type: "functionCall",
				args: [{ type: "str", value: "baz" }]
			}
		}
	}
]);

console.log(logs);
