import { runTests } from "../../../../tests/libtest.js";
import { generateAST } from "../components/ast.js";

const { logs } = await runTests([
	{
		function: generateAST,
		args: ['let var = "3"'],
		expectedResult: [
			{
				type: "call",
				value: {
					type: "newVariable",
					name: "var",
					value: { type: "str", value: "3" }
				}
			}
		]
	},
	{
		function: generateAST,
		args: [`global name = "Constellation"\n\nlog(name)`],
		expectedResult: {}
	}
]);
console.log(logs);
