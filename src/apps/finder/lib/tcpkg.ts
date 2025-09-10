import TerminalAlias from "../../../lib/terminalAlias";
import { getType } from "mime";

interface TCPackage {
	files: Record<string, string | { type: "binary" | "text"; data: string }>;
	directories: string[];
}

export default async function tcpkg(
	parent: TerminalAlias,
	packageDirectory: string,
	outputDirectory: string,
	...data: string[]
) {
	let logs = [];

	// get params from args
	const params: Record<string, string> = {};
	//const args = data
	//	.map((item) => {
	//		if (item[0] == "-") {
	//			// it's a parameter
	//			const name = item.substring(1, Infinity).split("=")[0];
	//			const value = item.substring(item.indexOf("=") + 1, Infinity);
	//
	//			params[name] = value;
	//
	//			return undefined;
	//		}
	//
	//		return item;
	//	})
	//	.filter((item) => item !== undefined);

	let verbose = params.v == "-v" || String(params["-verbose"]) == "true";

	if (["", undefined, null].includes(packageDirectory)) {
		throw new Error(`Usage:
tcpkg \${inputDirectory} \${outputFile}`);
	}

	const input = parent.env.fs.resolve(parent.path, packageDirectory);
	const output = parent.env.fs.resolve(
		parent.path,
		outputDirectory || "./app.idx"
	);

	async function checkOutput() {
		let content;
		try {
			const read = await parent.env.fs.readFile(output);
			if (!read.ok) throw read.data;
			content = read.data;
		} catch (e) {}

		if (content !== undefined) {
			throw new Error("Output directory isn't empty!");
		}
	}

	if (Boolean(params.override) !== true) {
		// insure we don't override a pre-existing file
		await checkOutput();
	}

	if (verbose) logs.push("Preparing to package...");

	// package info
	const pkg: TCPackage = {
		files: {},
		directories: []
	};

	// walk the folder
	async function walk(directory: string) {
		if (verbose) logs.push(`Walking ${directory}...`);
		const listDir = await parent.env.fs.listDirectory(directory);
		if (!listDir.ok) throw listDir.data;

		const ls = listDir.data;

		for (const item of ls) {
			const dir = parent.env.fs.resolve(directory, item);

			const stt = await parent.env.fs.stat(dir);
			if (!stt.ok) throw stt.data;
			const stat = stt.data;

			const isDir = stat.isDirectory();

			const relative: string = parent.env.fs.relative(input, dir);

			if (isDir) {
				// folder
				pkg.directories.push(relative);
				await walk(dir);
			} else {
				// file

				try {
					const type = getType(dir.textAfterAll("."));

					if (verbose)
						logs.push(`Packaging ${dir} with mime ${type}...`);

					if (type == null) {
						throw new Error(
							`Mime type for file at '${dir}' has returned null.`
						);
					}

					const isText =
						type.startsWith("text/") ||
						type.includes("xml") ||
						type.includes("javascript") ||
						type.includes("typescript") ||
						type.includes("json");

					if (isText) {
						const read = await parent.env.fs.readFile(dir);
						if (!read.ok) throw read.data;

						const content = read.data;

						pkg.files[relative] = content;
					} else {
						// encode to dataURI
						const read = await parent.env.fs.readFile(dir);
						if (!read.ok) throw read.data;
						const content = read.data;

						const b64 = btoa(content);
						const uri = `data:${type};base64,${b64}`;

						pkg.files[relative] = {
							type: "binary",
							data: uri
						};
					}
				} catch (e) {
					throw new Error(
						`Error ${e} occurred when packaging ${dir}. it has not been included in the index.`
					);
				}
			}
		}
	}

	try {
		await walk(input);
	} catch (e) {
		throw e;
	}

	logs.push(
		`Walking complete, ${pkg.directories.length} directories and ${Object.keys(pkg.files).length} files packaged`
	);

	// stringify it
	const result = JSON.stringify(pkg, null, 8);

	const write = await parent.env.fs.writeFile(output, result);
	if (!write.ok) throw write.data;

	logs.push("App packaged to '" + output + "' successfully!");

	return logs.join("\n");
}
