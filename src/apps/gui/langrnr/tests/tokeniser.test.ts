import { runTests } from "../../../../tests/libtest.js";
import { tokenise } from "../components/ast/tokenAst.js";

const { logs } = await runTests([
	// simple comma-separated values
	{
		args: ["a,b,c"],
		function: tokenise,
		expectedResult: ["a", "b", "c"]
	},
	{
		args: ["1, 2, 3"],
		function: tokenise,
		expectedResult: ["1", "2", "3"]
	},

	// quoted strings
	{
		args: ['"hello","world"'],
		function: tokenise,
		expectedResult: ['"hello"', '"world"']
	},
	{
		args: ["'a','b','c'"],
		function: tokenise,
		expectedResult: ["'a'", "'b'", "'c'"]
	},
	{
		args: ["`foo`,`bar`"],
		function: tokenise,
		expectedResult: ["`foo`", "`bar`"]
	},

	// numbers and variables
	{
		args: ["x,42,true"],
		function: tokenise,
		expectedResult: ["x", "42", "true"]
	},

	// nested brackets
	{
		args: ["func(1,2), [a,b,c], {key:value}"],
		function: tokenise,
		expectedResult: ["func(1,2)", "[a,b,c]", "{key:value}"]
	},
	{
		args: ["outer(inner(1,2),3),x"],
		function: tokenise,
		expectedResult: ["outer(inner(1,2),3)", "x"]
	},

	// mixed quotes inside brackets
	{
		args: ["array(['a','b'], \"c,d\"), 42"],
		function: tokenise,
		expectedResult: ["array(['a','b'], \"c,d\")", "42"]
	},
	{
		args: ["obj({key: 'value, with comma'}), true"],
		function: tokenise,
		expectedResult: ["obj({key: 'value, with comma'})", "true"]
	},
	// empty arguments
	{
		args: [",,"],
		function: tokenise,
		expectedResult: ["", "", ""]
	},

	// spaces around tokens
	{
		args: ["  a  ,  b , c "],
		function: tokenise,
		expectedResult: ["a", "b", "c"]
	},

	// deeply nested brackets
	{
		args: ["f(a(b(c,d), e), f(g)), h"],
		function: tokenise,
		expectedResult: ["f(a(b(c,d), e), f(g))", "h"]
	},

	// single token
	{
		args: ["onlyOne"],
		function: tokenise,
		expectedResult: ["onlyOne"]
	},

	// tricky quotes
	{
		args: ['"nested, comma", "another"'],
		function: tokenise,
		expectedResult: ['"nested, comma"', '"another"']
	},
	{
		args: ["'single,quote', `back,quote`"],
		function: tokenise,
		expectedResult: ["'single,quote'", "`back,quote`"]
	},

	// mismatched brackets
	{
		args: ["func(1,2"],
		function: tokenise,
		expectedResult: "none"
	},
	{
		args: ["array[1,2}"],
		function: tokenise,
		expectedResult: "none"
	},

	// brackets inside quotes (should not split)
	{
		args: ["{key: value]"],
		function: tokenise,
		expectedResult: "none"
	},
	{
		args: ["'[1,2,3]',('(a,b)')"],

		function: tokenise,
		expectedResult: ["'[1,2,3]'", "('(a,b)')"]
	},
	{
		args: ["'[1,2,3]','(a,b)')"],
		function: tokenise,
		expectedResult: "none"
	},
	{
		args: ["\"{a,b,c}\", 'foo,bar'"],
		function: tokenise,
		expectedResult: ['"{a,b,c}"', "'foo,bar'"]
	},

	// quotes inside brackets
	{
		args: ["arr([\"a,b\", 'c,d'], e)"],
		function: tokenise,
		expectedResult: ["arr([\"a,b\", 'c,d'], e)"]
	},

	// nested brackets + quotes
	{
		args: ["f([1,2,'3,4'], g(\"x,y\"))"],
		function: tokenise,
		expectedResult: ["f([1,2,'3,4'], g(\"x,y\"))"]
	},

	// consecutive commas
	{
		args: ["a,,b"],
		function: tokenise,
		expectedResult: ["a", "", "b"]
	},
	{
		args: [",,c"],
		function: tokenise,
		expectedResult: ["", "", "c"]
	},

	// spaces around tricky tokens
	{
		args: ["  func( 'a,b', [c,d] )  , 42 "],
		function: tokenise,
		expectedResult: ["func( 'a,b', [c,d] )", "42"]
	},

	// single quotes inside double quotes
	{
		args: ["\"a,'b',c\", d"],
		function: tokenise,
		expectedResult: ["\"a,'b',c\"", "d"]
	},

	// backticks with commas
	{
		args: ["`x,y`,`z`"],
		function: tokenise,
		expectedResult: ["`x,y`", "`z`"]
	},

	// deeply nested incorrect brackets
	{
		args: ["f(a(b(c,d), e), f(g)"],
		function: tokenise,
		expectedResult: "none"
	},

	// brackets and quotes together
	{
		args: ["arr([`1,2`,`3,4`], {key:'val,ue'})"],
		function: tokenise,
		expectedResult: ["arr([`1,2`,`3,4`], {key:'val,ue'})"]
	},

	// variable declaration
	{
		args: ['let var = "text!"'],
		function: tokenise,
		expectedResult: ["let", "var", "=", '"text!"']
	},

	// chaos line: nested brackets, mixed quotes, commas inside quotes, spaces
	{
		args: [
			"func1( arr([1,\"2,3\", '4,5', `6,7']), obj({a: 'b,c'}), nested(inner(\"x,y\"), 'z')) , foo , bar "
		],
		function: tokenise,
		expectedResult: [
			"func1( arr([1,\"2,3\", '4,5', `6,7']), obj({a: 'b,c'}), nested(inner(\"x,y\"), 'z'))",
			"foo",
			"bar"
		]
	},

	// chaos line: intentionally mismatched brackets (should trigger error)
	{
		args: ["f(a(b,c), [1,2,3}"],
		function: tokenise,
		expectedResult: "none"
	},

	// chaos line: quotes inside brackets and brackets inside quotes
	{
		args: ["g(\"[1,2,3]\", '({a,b})', `func(x,y)`)"],
		function: tokenise,
		expectedResult: ["g(\"[1,2,3]\", '({a,b})', `func(x,y)`)"]
	},

	// chaos line: multiple consecutive commas and empty tokens
	{
		args: ["a,,b,,,c"],
		function: tokenise,
		expectedResult: ["a", "", "b", "", "", "c"]
	},

	// chaos line: spaces, tabs, and newlines (splitOnSpaces test)
	{
		args: ['let   foo\t=  "bar, baz"'],
		function: tokenise,
		expectedResult: ["let", "foo", "=", '"bar, baz"']
	},

	// chaos line: deeply nested valid brackets and quotes
	{
		args: ["outer(inner1(a, [b, c], {d: 'e,f'}), inner2(\"x,y\", `z`))"],
		function: tokenise,
		expectedResult: [
			"outer(inner1(a, [b, c], {d: 'e,f'}), inner2(\"x,y\", `z`))"
		]
	}
]);

console.log(logs);
