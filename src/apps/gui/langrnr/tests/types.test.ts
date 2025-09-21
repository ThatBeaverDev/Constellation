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
	{ function: getTokenType, args: ["{}"], expectedResult: "dict" },
	{ function: getTokenType, args: ['{"a":1}'], expectedResult: "dict" },
	// conditionals
	{ function: getTokenType, args: ["7 == 5"], expectedResult: "conditional" },
	{ function: getTokenType, args: ["7 > 5"], expectedResult: "conditional" },
	{ function: getTokenType, args: ["7 < 5"], expectedResult: "conditional" },
	{ function: getTokenType, args: ["a == b"], expectedResult: "conditional" },
	// others
	{ function: getTokenType, args: ["word"], expectedResult: "var" },
	{ function: getTokenType, args: ["foo(bar)"], expectedResult: "code" },
	{ function: getTokenType, args: [" 42 "], expectedResult: "num" },
	{ function: getTokenType, args: ["３"], expectedResult: "none" },
	{ function: getTokenType, args: ['"你好"'], expectedResult: "str" },
	{ function: getTokenType, args: ["let var = 3"], expectedResult: "code" }
]);

console.log(logs);
