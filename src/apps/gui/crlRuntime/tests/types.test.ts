import { runTests } from "../../../../tests/libtest.js";
import { getTokenType } from "../components/ast/types.js";

const { logs } = await runTests([
	// string tests
	{ function: getTokenType, args: ['""'], expectedResult: "str" },
	{ function: getTokenType, args: ['" "'], expectedResult: "str" },
	{ function: getTokenType, args: ['"123"'], expectedResult: "str" },
	{ function: getTokenType, args: ['"false"'], expectedResult: "str" },
	{ function: getTokenType, args: ['"true "'], expectedResult: "str" },
	{ function: getTokenType, args: ['"abc`'], expectedResult: "none" },
	{
		function: getTokenType,
		args: ["'single-quoted'"],
		expectedResult: "str"
	},
	// number tests
	{ function: getTokenType, args: ["0123"], expectedResult: "num" },
	{ function: getTokenType, args: ["NaN"], expectedResult: "var" },
	{ function: getTokenType, args: ["infinity"], expectedResult: "num" },
	{ function: getTokenType, args: ["-0"], expectedResult: "num" },
	{ function: getTokenType, args: ["42"], expectedResult: "num" },
	// boolean tests
	{ function: getTokenType, args: ["true"], expectedResult: "bool" },
	{ function: getTokenType, args: ["false"], expectedResult: "bool" },
	{ function: getTokenType, args: ["TRUE"], expectedResult: "var" },
	{ function: getTokenType, args: ["False"], expectedResult: "var" },
	{ function: getTokenType, args: ["truefalse"], expectedResult: "var" },
	// lists / dicts
	{ function: getTokenType, args: ["[]"], expectedResult: "list" },
	{ function: getTokenType, args: ["[1,2,3]"], expectedResult: "list" },
	{ function: getTokenType, args: ["obj{}"], expectedResult: "dict" },
	{ function: getTokenType, args: ['obj{"a":1}'], expectedResult: "dict" },
	// operations
	{ function: getTokenType, args: ["7 == 5"], expectedResult: "operation" },
	{ function: getTokenType, args: ["7 > 5"], expectedResult: "operation" },
	{ function: getTokenType, args: ["7 < 5"], expectedResult: "operation" },
	{ function: getTokenType, args: ["a == b"], expectedResult: "operation" },
	// others
	{ function: getTokenType, args: ["word"], expectedResult: "var" },
	{ function: getTokenType, args: ["foo(bar)"], expectedResult: "code" },
	{ function: getTokenType, args: [" 42 "], expectedResult: "num" },
	{ function: getTokenType, args: ["３"], expectedResult: "none" },
	{ function: getTokenType, args: ['"你好"'], expectedResult: "str" },
	{ function: getTokenType, args: ["let var = 3"], expectedResult: "code" },

	// meaner tests
	// strings
	{ function: getTokenType, args: ['"unterminated'], expectedResult: "none" },
	{ function: getTokenType, args: ["''"], expectedResult: "str" },
	{ function: getTokenType, args: ["``"], expectedResult: "str" },
	{ function: getTokenType, args: ['"\\n"'], expectedResult: "str" }, // escape sequence
	{ function: getTokenType, args: ['"a"b"'], expectedResult: "none" },
	{ function: getTokenType, args: ['"multi\nline"'], expectedResult: "str" },
	// numbers
	{ function: getTokenType, args: ["-42"], expectedResult: "num" },
	{ function: getTokenType, args: ["42."], expectedResult: "num" },
	{ function: getTokenType, args: ["1.2.3"], expectedResult: "none" },
	{ function: getTokenType, args: ["--42"], expectedResult: "none" },
	{ function: getTokenType, args: ["0xFF"], expectedResult: "var" }, // hex unsupported
	{ function: getTokenType, args: ["infinity"], expectedResult: "num" },
	{ function: getTokenType, args: ["Infinity"], expectedResult: "var" }, // case sensitive

	// boolean
	{ function: getTokenType, args: ["TRUE"], expectedResult: "var" },
	{ function: getTokenType, args: ["Falsey"], expectedResult: "var" },
	{ function: getTokenType, args: ["truefalse"], expectedResult: "var" },
	// lists & dicts
	{ function: getTokenType, args: ["[]"], expectedResult: "list" },
	{ function: getTokenType, args: ["[1, 2, 3]"], expectedResult: "list" }, // spaced commas
	{ function: getTokenType, args: ["[1,2,3]"], expectedResult: "list" }, // compact still ok
	{ function: getTokenType, args: ["obj{}"], expectedResult: "dict" },
	{ function: getTokenType, args: ['obj{"a": 1}'], expectedResult: "dict" }, // space after colon
	{ function: getTokenType, args: ["obj{a:1}"], expectedResult: "dict" }, // compact form

	{ function: getTokenType, args: ["{"], expectedResult: "none" }, // broken
	// operations
	{ function: getTokenType, args: ["a == b"], expectedResult: "operation" },
	{ function: getTokenType, args: ["a==b"], expectedResult: "none" }, // no whitespace → not operation
	{ function: getTokenType, args: ["7 > 5"], expectedResult: "operation" },
	{ function: getTokenType, args: ["7>5"], expectedResult: "none" }, // no whitespace
	{
		function: getTokenType,
		args: ["x < y < z"],
		expectedResult: "operation"
	}, // multi-step supported
	{ function: getTokenType, args: ["=="], expectedResult: "none" }, // bare operator
	{ function: getTokenType, args: ["x >= y"], expectedResult: "operation" },
	{ function: getTokenType, args: ["x => y"], expectedResult: "none" }, // not a real operation
	{ function: getTokenType, args: ["x + y"], expectedResult: "operation" },
	{ function: getTokenType, args: ["x - y"], expectedResult: "operation" },
	{ function: getTokenType, args: ["x / y"], expectedResult: "operation" },
	{ function: getTokenType, args: ["x * y"], expectedResult: "operation" },
	{ function: getTokenType, args: ["x ** y"], expectedResult: "operation" },
	{ function: getTokenType, args: ["x % y"], expectedResult: "operation" },
	{
		function: getTokenType,
		args: ['"Hello" + punctuation + " World!"'],
		expectedResult: "operation"
	},
	{
		function: getTokenType,
		args: ["(1 + 2) > (2 * 3)"],
		expectedResult: "operation"
	},

	// variables
	{ function: getTokenType, args: ["abc123"], expectedResult: "var" },
	{ function: getTokenType, args: ["_abc"], expectedResult: "var" },
	{ function: getTokenType, args: ["ABC"], expectedResult: "var" },
	{ function: getTokenType, args: ["varname"], expectedResult: "var" },
	{ function: getTokenType, args: ["var_name_123"], expectedResult: "var" },
	{ function: getTokenType, args: ["你好"], expectedResult: "none" }, // unicode not allowed
	{
		function: getTokenType,
		args: ["name-with-dash"],
		expectedResult: "none"
	},
	{ function: getTokenType, args: ["$dollar"], expectedResult: "none" },

	// code
	{ function: getTokenType, args: ["foo(bar)"], expectedResult: "code" },
	{ function: getTokenType, args: ["foo (bar)"], expectedResult: "code" }, // whitespace allowed
	{ function: getTokenType, args: ["let x = 5"], expectedResult: "code" },
	{ function: getTokenType, args: ["letx=5"], expectedResult: "none" }, // no keyword spacing
	{ function: getTokenType, args: ["const y=3"], expectedResult: "code" }, // missing spaces
	{
		function: getTokenType,
		args: ["global myVar = 1"],
		expectedResult: "code"
	},
	// has a block
	{
		function: getTokenType,
		args: ['function() {\nprintln("Hello!");\n};'],
		expectedResult: "code"
	},
	// no arguement container with a block
	{
		function: getTokenType,
		args: ['function {\nprintln("Hi!");\n};'],
		expectedResult: "code"
	},

	// code blocks
	{
		function: getTokenType,
		args: ['{\n\tprintln("Hello!");\n}'],
		expectedResult: "block"
	},

	// writespace & control
	{ function: getTokenType, args: ["\t42\t"], expectedResult: "num" },
	{ function: getTokenType, args: ["\ntrue\n"], expectedResult: "bool" },
	{ function: getTokenType, args: [" "], expectedResult: "none" },
	{ function: getTokenType, args: [" word "], expectedResult: "var" }, // unicode spaces
	{ function: getTokenType, args: ["\u200Bhidden"], expectedResult: "none" } // zero-width space
]);

console.log(logs);
