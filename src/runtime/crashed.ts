import ConstellationKernel from "../kernel.js";
import { ProcessInformation } from "./runtime.js";

function trueStringifier(value: any, space?: number): string {
	const seen = new WeakSet();

	return JSON.stringify(
		value,
		(key, val) => {
			// Handle functions explicitly
			if (typeof val === "function") {
				return val.toString();
			}

			// Handle symbols
			if (typeof val === "symbol") {
				return val.toString();
			}

			// Handle objects with cycles
			if (val && typeof val === "object") {
				if (seen.has(val)) {
					return "[ConstellationCoreDumpExtractor] - Link to already observed object, removed to prevent recursion";
				}
				seen.add(val);
			}

			return val;
		},
		space
	);
}

export default function createCoreDump(crashedProgram: ProcessInformation) {
	console.warn("Creating core dump...");

	const state = trueStringifier(crashedProgram.program, 4);

	const dump = `CONSTELLATION CORE DUMP: ${crashedProgram.directory}
	
PROGRAM STARTED AT ${crashedProgram.startTime}.
PROGRAM CRASHED ON PROCEXEC: ${crashedProgram.counter}.
PROGRAM HAD ${crashedProgram.children.length} CHILD PROCESSES.

PROGRAM OBJECT STATE:
${state}

END OF DUMP.`;

	return dump;
}

export function nameCoreDump(crashedProgram: ProcessInformation) {
	return `coreDump-${crashedProgram.startTime}-${crashedProgram.directory.replaceAll("/", "_")}`;
}

export async function dump(
	ConstellationKernel: ConstellationKernel,
	crashedProgram: ProcessInformation
) {
	const name = nameCoreDump(crashedProgram);
	const content = createCoreDump(crashedProgram);

	const directory = `/System/dumps/${name}`;
	console.warn(directory);

	await ConstellationKernel.fs.writeFile(directory, content);
}
