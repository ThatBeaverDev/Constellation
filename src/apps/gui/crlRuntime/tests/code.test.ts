import { runTests } from "../../../../tests/libtest.js";
import { generateAST } from "../components/ast/ast.js";

const { logs } = await runTests([
	{
		function: generateAST,
		args: ['let var = "3"'],
		expectedResult: [
			{
				type: "code",
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
		args: [`global name = "Constellation";\n\nlog(name);`],
		expectedResult: [
			{
				type: "code",
				value: {
					type: "newGlobal",
					name: "name",
					value: { type: "str", value: "Constellation" }
				}
			},
			{
				type: "code",
				value: {
					function: { type: "var", value: "log" },
					type: "functionCall",
					args: [{ type: "var", value: "name" }]
				}
			}
		]
	},
	{
		function: generateAST,
		args: ["if (5 > 3) {}"],
		expectedResult: [
			{
				type: "code",
				value: {
					function: { type: "var", value: "if" },
					type: "functionCall",
					args: [
						{
							type: "operation",
							value: {
								type: "greaterThan",
								first: { type: "num", value: 5 },
								second: { type: "num", value: 3 }
							}
						},
						{
							type: "block",
							value: []
						}
					]
				}
			}
		]
	},
	{
		function: generateAST,
		args: [
			'// tester\n\nconst a = 5;\nconst b = 7;\n\nif (b > a) {\n\tprintln("B is greater than A");\n};\nif (b < a) {\n\tprintln("A is greater than B");\n};\n\nprintln(a);\nprintln(b);'
		],
		expectedResult: [
			{
				type: "code",
				value: {
					type: "newConstant",
					name: "a",
					value: { type: "num", value: 5 }
				}
			},
			{
				type: "code",
				value: {
					type: "newConstant",
					name: "b",
					value: { type: "num", value: 7 }
				}
			},
			{
				type: "code",
				value: {
					function: { type: "var", value: "if" },
					type: "functionCall",
					args: [
						{
							type: "operation",
							value: {
								type: "greaterThan",
								first: { type: "var", value: "b" },
								second: { type: "var", value: "a" }
							}
						},
						{
							type: "block",
							value: [
								{
									type: "code",
									value: {
										function: {
											type: "var",
											value: "println"
										},
										type: "functionCall",
										args: [
											{
												type: "str",
												value: "B is greater than A"
											}
										]
									}
								}
							]
						}
					]
				}
			},
			{
				type: "code",
				value: {
					function: { type: "var", value: "if" },
					type: "functionCall",
					args: [
						{
							type: "operation",
							value: {
								type: "lessThan",
								first: { type: "var", value: "b" },
								second: { type: "var", value: "a" }
							}
						},
						{
							type: "block",
							value: [
								{
									type: "code",
									value: {
										function: {
											type: "var",
											value: "println"
										},
										type: "functionCall",
										args: [
											{
												type: "str",
												value: "A is greater than B"
											}
										]
									}
								}
							]
						}
					]
				}
			},
			{
				type: "code",
				value: {
					function: { type: "var", value: "println" },
					type: "functionCall",
					args: [{ type: "var", value: "a" }]
				}
			},
			{
				type: "code",
				value: {
					function: { type: "var", value: "println" },
					type: "functionCall",
					args: [{ type: "var", value: "b" }]
				}
			}
		]
	},
	// block during variable declaration
	{
		function: generateAST,
		args: ["let func = function() {\n\tprintln('Hello!')\n}"],
		expectedResult: [
			{
				type: "code",
				value: {
					type: "newVariable",
					name: "func",
					value: {
						type: "code",
						value: {
							function: { type: "var", value: "function" },
							type: "functionCall",
							args: [
								{
									type: "block",
									value: [
										{
											type: "code",
											value: {
												function: {
													type: "var",
													value: "println"
												},
												type: "functionCall",
												args: [
													{
														type: "str",
														value: "Hello!"
													}
												]
											}
										}
									]
								}
							]
						}
					}
				}
			}
		]
	}
]);
console.log(logs);
