import { generateAST } from "../components/ast.js";

const code = `
const constant = "Hello, world!"

let reassignable = 0.675.4536

global baba = true

log("Hello, world!")
`;

console.log(generateAST(code));
