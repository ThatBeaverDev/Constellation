import ConstellationKernel from "../../kernel.js";
import { ProcessInformation } from "../runtime.js";

function trueStringifier(value: any, space?: number): string {
	const seen = new WeakSet();

	function safeSerialize(val: any): any {
		// Primitive safe pass-through
		if (val === null || typeof val !== "object") {
			if (typeof val === "bigint") {
				return `${val}n`; // safe fallback
			}
			if (typeof val === "function") {
				return val.toString();
			}
			if (typeof val === "symbol") {
				return val.toString();
			}
			return val;
		}

		// Cycle detection
		if (seen.has(val)) {
			return "[ConstellationCoreDumpExtractor] - Link to already observed object, removed to prevent recursion";
		}
		seen.add(val);

		// Handle arrays
		if (Array.isArray(val)) {
			const out: any[] = [];
			for (let i = 0; i < val.length; i++) {
				try {
					out[i] = safeSerialize(val[i]);
				} catch (e) {
					out[i] = `[Error extracting array item: ${String(e)}]`;
				}
			}
			return out;
		}

		// Handle objects
		const out: Record<string, any> = {};
		for (const key of Object.keys(val)) {
			try {
				const v = val[key]; // this may throw if getter explodes
				out[key] = safeSerialize(v);
			} catch (e) {
				out[key] = `[Error extracting property '${key}': ${String(e)}]`;
			}
		}
		return out;
	}

	try {
		return JSON.stringify(safeSerialize(value), null, space);
	} catch (e) {
		// Final guarantee: you get something
		return `[Unserializable data: ${String(e)}]`;
	}
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

	const directory = `/System/dumps/${name}.txt`;
	console.warn(`Creating core dump at ${directory}...`);

	await ConstellationKernel.fs.writeFile(directory, content);
}
