import { runTests } from "../../../../tests/libtest.js";
import { removeComments } from "../components/ast/comments.js";

const { logs } = await runTests([
	// simple comment removal
	{
		function: removeComments,
		args: ["hello // world"],
		expectedResult: "hello"
	},
	{ function: removeComments, args: ["42 // number"], expectedResult: "42" },
	{
		function: removeComments,
		args: ["myVar=5 // assign"],
		expectedResult: "myVar=5"
	},

	// no comments at all
	{
		function: removeComments,
		args: ["just some code"],
		expectedResult: "just some code"
	},
	{
		function: removeComments,
		args: ["func(x,y)"],
		expectedResult: "func(x,y)"
	},

	// comments inside quotes should stay
	{
		function: removeComments,
		args: ['"this // is not a comment"'],
		expectedResult: '"this // is not a comment"'
	},
	{
		function: removeComments,
		args: ["'path://example'"],
		expectedResult: "'path://example'"
	},
	{
		function: removeComments,
		args: ["`template // literal`"],
		expectedResult: "`template // literal`"
	},

	// comments after quotes should still strip
	{
		function: removeComments,
		args: ['"hello" // world'],
		expectedResult: '"hello"'
	},

	// brackets containing slashes
	{
		function: removeComments,
		args: ["arr = [1, 2, 3/4] // comment"],
		expectedResult: "arr = [1, 2, 3/4]"
	},
	{
		function: removeComments,
		args: ["obj = { path: '/user' } // end"],
		expectedResult: "obj = { path: '/user' }"
	},

	// nested brackets with slashes
	{
		function: removeComments,
		args: ["func({a: [1, 2/3]}) // nested"],
		expectedResult: "func({a: [1, 2/3]})"
	},

	// edge: comment at start
	{
		function: removeComments,
		args: ["// full line comment"],
		expectedResult: ""
	},
	{
		function: removeComments,
		args: ["   // indented comment"],
		expectedResult: ""
	},

	// edge: comment with only one slash (should not trigger)
	{ function: removeComments, args: ["a / b"], expectedResult: "a / b" },
	{
		function: removeComments,
		args: ["/ standalone"],
		expectedResult: "/ standalone"
	},

	// tricky: `//` inside nested quotes & brackets
	{
		function: removeComments,
		args: ["call(['a//b', 'c']) // remove"],
		expectedResult: "call(['a//b', 'c'])"
	},
	{
		function: removeComments,
		args: ['dict({key: "//val"}) // gone'],
		expectedResult: 'dict({key: "//val"})'
	},

	// multi-line snippets
	{
		function: removeComments,
		args: ["line1 // cut\nline2"],
		expectedResult: "line1\nline2"
	},
	{
		function: removeComments,
		args: ["a=1\nb=2 // comment\nc=3"],
		expectedResult: "a=1\nb=2\nc=3"
	},

	// lots of slashes in a row
	{ function: removeComments, args: ["////"], expectedResult: "" }, // whole line comment
	{ function: removeComments, args: ["a //// b"], expectedResult: "a" }, // comment after token
	{
		function: removeComments,
		args: ["x /// not a comment"],
		expectedResult: "x"
	}, // still comment start

	// slashy tokens
	{
		function: removeComments,
		args: ["regex=/ab+c/ // regex"],
		expectedResult: "regex=/ab+c/"
	},
	{
		function: removeComments,
		args: ["divide = a/b // math"],
		expectedResult: "divide = a/b"
	},

	// comment directly after quote
	{
		function: removeComments,
		args: ['"abc"//comment'],
		expectedResult: '"abc"'
	},
	{
		function: removeComments,
		args: ["'def'//inline"],
		expectedResult: "'def'"
	},
	{
		function: removeComments,
		args: ["`ghi`//template"],
		expectedResult: "`ghi`"
	},

	// comment inside quotes (should stay literal)
	{
		function: removeComments,
		args: ['"http://example.com"'],
		expectedResult: '"http://example.com"'
	},
	{
		function: removeComments,
		args: ["'C:\\\\path\\\\file'"],
		expectedResult: "'C:\\\\path\\\\file'"
	},

	// multiple lines with odd slashes
	{
		function: removeComments,
		args: ["code // one\nmore /// two\nend"],
		expectedResult: "code\nmore\nend"
	},
	{
		function: removeComments,
		args: ["a//first\nb//second\nc"],
		expectedResult: "a\nb\nc"
	},

	// trailing spaces after comments
	{
		function: removeComments,
		args: ["foo // bar   "],
		expectedResult: "foo"
	},

	// fake comments with quotes
	{
		function: removeComments,
		args: ['"//notComment" // real'],
		expectedResult: '"//notComment"'
	},
	{
		function: removeComments,
		args: ["'//stillString' // cut"],
		expectedResult: "'//stillString'"
	},

	// edge: slash at the end of line
	{ function: removeComments, args: ["foo/"], expectedResult: "foo/" },
	{ function: removeComments, args: ["bar //"], expectedResult: "bar" },

	// many slashes plus quotes
	{
		function: removeComments,
		args: ["'////' // actual"],
		expectedResult: "'////'"
	},
	{
		function: removeComments,
		args: ['"///"//weird'],
		expectedResult: '"///"'
	}
]);
console.log(logs);
