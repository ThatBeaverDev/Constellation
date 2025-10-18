import TerminalAlias from "../../../../system/lib/terminalAlias.js";

export default async function tcupkg(
	parent: TerminalAlias,
	target: string,
	output: string
) {
	const targetRel = parent.env.fs.resolve(parent.path, target);
	const directory = parent.env.fs.resolve(parent.path, output);

	let read = await parent.env.fs.readFile(targetRel);
	if (!read.ok) throw read.data;

	const content = read.data;

	let json;

	await parent.env.fs.createDirectory(directory);

	try {
		json = JSON.parse(content);
	} catch {
		throw new Error(`Package is not packaged properly.`);
	}

	for (const path of json.directories) {
		const relative = parent.env.fs.resolve(directory, path);

		await parent.env.fs.createDirectory(relative);
	}

	const awaitFiles = [];
	for (const path in json.files) {
		const data = json.files[path];
		const relative = parent.env.fs.resolve(directory, path);

		const type = data.type == undefined ? "string" : data.type;

		switch (type) {
			case "string":
				awaitFiles.push(parent.env.fs.writeFile(relative, data));
				break;
			case "binary":
				awaitFiles.push(parent.env.fs.writeFile(relative, data.data));
				break;
			default:
				throw new Error(
					"Unknown key type within files object: '" + type + "'"
				);
		}
	}

	for (const item of awaitFiles) {
		await item;
	}
}
