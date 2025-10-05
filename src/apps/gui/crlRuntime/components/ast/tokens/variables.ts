import { ReassignmentReference, ReassignmentType } from "../../config.js";
import { AstCallNode } from "../../definitions.js";
import AstGenerator from "../ast.js";

export default class VariableTokenAstGenerator {
	constructor(public generator: AstGenerator) {}

	generateDeclaration(
		token: string,
		tokens: string[],
		type: "newVariable" | "newConstant" | "newGlobal",
		debug: typeof console.debug
	) {
		debug("token", token, " is let declaration");

		if (tokens[2] !== "=") {
			throw new Error(
				`(${tokens[2]} is not valid during variable declaration`
			);
		}

		const obj: AstCallNode = {
			type: "code",
			value: {
				type,
				name: tokens[1],
				value: this.generator.generateTokenAST(
					tokens.splice(3, Infinity).join(" "),
					debug
				)
			}
		};

		return obj;
	}
	generateReassignment(
		token: string,
		tokens: string[],
		debug: typeof console.debug
	) {
		debug("token", token, " is reassignment");

		let reassignmentType: ReassignmentReference;
		switch (tokens[1] as ReassignmentType) {
			case "=":
				reassignmentType = "assign";
				break;
			case "+=":
				reassignmentType = "add";
				break;
			case "-=":
				reassignmentType = "minus";
				break;
			case "*=":
				reassignmentType = "multiply";
				break;
			case "/=":
				reassignmentType = "divide";
				break;
			case "**=":
				reassignmentType = "exponent";
				break;
			case "%=":
				reassignmentType = "remainder";
				break;
			default:
				throw new Error(
					`${tokens[1]} is not implemented in AST generation for reassignment.`
				);
		}

		const obj: AstCallNode = {
			type: "code",
			value: {
				type: "reassignment",
				name: tokens[0],
				reassignmentType,
				value: this.generator.generateTokenAST(
					tokens.splice(2, Infinity).join(" "),
					debug
				)
			}
		};

		return obj;
	}
}
