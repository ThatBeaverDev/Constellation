type characterType = "operator" | "bracket" | "number" | "variable" | "";

type binaryOperator = "+" | "-" | "*" | "/" | "%" | "^" | "√";
type unaryOperator = "~" | "\\" | "|" | "√";

function characterType(character: string): characterType {
	switch (character) {
		// binary
		case "+": // addition
		case "-": // subtraction
		case "*": // multiplication
		case "/": // division
		case "%": // modulo
		case "^": // powers
		case "√": // root

		// unary
		case "~": // sine
		case "\\": // cosine
		case "|": // tangent
		case "!": // makes sine into sine^-1, cosine in cosine^-1 and tangent into tangent^-1.
			return "operator";

		case "(":
		case ")":
			return "bracket";
		case "0":
		case "1":
		case "2":
		case "3":
		case "4":
		case "5":
		case "6":
		case "7":
		case "8":
		case "9":
		case ".": // for decimal places
			return "number";
		//case "=":
		//    return "assignment"
		case " ":
			return "";
		default:
			return "variable";
	}
}

export function tokenise(characters: string): string[] {
	const chars = characters.split("");

	const tokens: string[] = [];
	let staging = "";
	let lastType = "";
	let numbericClosingBracket: boolean = false;

	function pushStaging(char: string, type: characterType) {
		tokens.push(staging);

		if (numbericClosingBracket) {
			numbericClosingBracket = false;
			tokens.push(")");
		}
		staging = char;
		lastType = type;
	}

	for (const char of chars) {
		const type = characterType(char);

		if (type == "variable") {
			tokens.push(staging);

			if (["number", "variable"].includes(lastType)) {
				const last: number = tokens.length - 1;

				const lastToken: string = tokens[last];

				tokens[last] = "(";

				tokens.push(lastToken);
				tokens.push("*");
				numbericClosingBracket = true;
			}

			staging = char;
			lastType = type;
			continue;
		}

		if (type == lastType && type !== "bracket") {
			staging += char;
		} else {
			pushStaging(char, type);
		}
	}

	pushStaging("", "variable");

	return tokens.filter((item) => item.trim() !== "");
}

type Token = { token: string; type: characterType };

type ASTNode =
	| { type: "literal"; value: number }
	| {
			type: "binaryExpression";
			operator: binaryOperator;
			left: ASTNode;
			right: ASTNode;
	  }
	| { type: "unaryExpression"; operator: unaryOperator; value: ASTNode }
	| { type: "variable"; value: string };

type ASTStaticNode =
	| { type: "literal"; value: number }
	| {
			type: "binaryExpression";
			operator: binaryOperator;
			left: ASTStaticNode;
			right: ASTStaticNode;
	  }
	| {
			type: "unaryExpression";
			operator: unaryOperator;
			value: ASTStaticNode;
	  };

// Get tokens with types
function tokeniseAndType(input: string): Token[] {
	return tokenise(input).map((token) => ({
		token,
		type: characterType(token[0])
	}));
}

// parser which understands types
export function generateAST(input: string): ASTNode {
	const tokens = tokeniseAndType(input);
	let pos = 0;

	function peek(): Token | undefined {
		return tokens[pos];
	}

	function consume(): Token {
		return tokens[pos++];
	}

	// parse number or expressions without parenthesis.
	function parsePrimary(): ASTNode {
		const token = peek();

		if (!token) throw new Error("Unexpected end of input");

		if (token.type === "number") {
			consume();
			return {
				type: "literal",
				value: parseFloat(token.token)
			};
		}

		if (token.token === "(") {
			consume(); // consume "("
			const expression = parseExpression();
			if (!peek() || peek()?.token !== ")")
				throw new Error("Expected ')'");
			consume(); // consume ")"
			return expression;
		}

		if (token.type == "variable") {
			consume();
			return {
				type: "variable",
				value: token.token
			};
		}

		throw new Error(`Unexpected token: ${token.token}`);
	}

	// exponentiation (right-associative)
	function parseExponent(): ASTNode {
		let node = parseUnary();

		while (peek() && peek()!.token === "^") {
			// @ts-expect-error
			const operator: binaryOperator = consume().token;

			const right = parseExponent(); // recursive for right-associativity
			node = {
				type: "binaryExpression",
				operator,
				left: node,
				right
			};
		}

		return node;
	}

	function parseUnary(): ASTNode {
		const token = peek();

		// handle unary suff like ~ and \ and | and √
		if (token && ["~", "\\", "|", "√"].includes(token.token)) {
			// @ts-expect-error
			const operator: unaryOperator = consume().token;
			const argument = parseUnary(); // allow chaining (√~x)
			return {
				type: "unaryExpression",
				operator,
				value: argument
			};
		}

		// otherwise, parse a regular primary
		return parsePrimary();
	}

	// multiplication/division/modulo (left-associative)
	function parseFactor(): ASTNode {
		let node = parseExponent();

		while (peek() && ["*", "/", "%"].includes(peek()!.token)) {
			// @ts-expect-error
			const operator: binaryOperator = consume().token;
			const right = parseUnary();
			node = {
				type: "binaryExpression",
				operator,
				left: node,
				right
			};
		}

		return node;
	}

	// addition/subtraction (left-associative)
	function parseExpression(): ASTNode {
		let node = parseFactor();

		while (peek() && ["+", "-"].includes(peek()!.token)) {
			// @ts-expect-error
			const operator: binaryOperator = consume().token;
			const right = parseFactor();
			node = {
				type: "binaryExpression",
				operator,
				left: node,
				right
			};
		}

		return node;
	}

	const ast = parseExpression();

	if (pos < tokens.length) {
		throw new Error(`Unexpected token: ${tokens[pos].token}`);
	}

	return ast;
}

// 7 * (25 * 2.7554) ^ (2 * 0.346)
export function astWithVariables(calculation: string): ASTStaticNode {
	const ast = generateAST(calculation);

	function assignBit(bit: ASTNode) {
		switch (bit.type) {
			case "binaryExpression":
				assignBit(bit.left);
				assignBit(bit.right);
				break;
			case "variable":
				const value = getVariable(bit.value);

				const newNode: ASTStaticNode = {
					type: "literal",
					value: value
				};

				Object.assign(bit, newNode);
				break;
			case "unaryExpression":
				assignBit(bit.value);
				break;
		}
	}

	assignBit(ast);

	// @ts-expect-error
	return ast;
}

export const variables: Record<string, number> = {};
export function setVariable(letter: string, value: number) {
	if (letter.length !== 1) throw new Error("bad length");

	variables[letter] = value;
}
export function getVariable(letter: string): number {
	if (letter.length !== 1) throw new Error("bad length");

	const value = variables[letter];

	return value;
}

export function evaluate(calculation: string) {
	const ast = astWithVariables(calculation);

	function calculateBit(bit: ASTStaticNode): number {
		switch (bit.type) {
			case "binaryExpression": {
				switch (bit.operator) {
					case "+":
						return calculateBit(bit.left) + calculateBit(bit.right);
					case "-":
						return calculateBit(bit.left) - calculateBit(bit.right);
					case "*":
						return calculateBit(bit.left) * calculateBit(bit.right);
					case "/":
						return calculateBit(bit.left) / calculateBit(bit.right);
					case "^":
						return Math.pow(
							calculateBit(bit.left),
							calculateBit(bit.right)
						);
					case "%":
						return calculateBit(bit.left) % calculateBit(bit.right);
					case "√":
						return Math.pow(
							calculateBit(bit.left),
							1 / calculateBit(bit.right)
						);
					default:
						console.warn("[!] zeroing for ", bit);
						return 0;
				}
			}
			case "literal":
				return Number(bit.value);
			case "unaryExpression":
				switch (bit.operator) {
					case "~":
						return Math.sin(calculateBit(bit.value));
					case "\\":
						return Math.cos(calculateBit(bit.value));
					case "|":
						return Math.tan(calculateBit(bit.value));
					case "√":
						return Math.sqrt(calculateBit(bit.value));
					default:
						console.warn("[!] zeroing for ", bit);
						return 0;
				}
		}
	}

	return calculateBit(ast);
}
