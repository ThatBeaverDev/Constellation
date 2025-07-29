import TerminalAlias from "../../../lib/terminalAlias";

export default async function tcupkg(
	parent: TerminalAlias,
	target: string,
	output: string
) {
	const targetRel = parent.env.fs.resolve(parent.path, target);
	const directory = parent.env.fs.resolve(parent.path, output);

	let content = await env.fs.readFile(targetRel);
	if (!content.ok) throw content.data;
	content = content.data;

	let json;

	await env.fs.createDirectory(directory);

	try {
		json = JSON.parse(content.data);
	} catch {
		throw new Error(`Package is not packaged properly.`);
	}

	for (const path of json.directories) {
		const relative = env.fs.resolve(directory, path);

		await env.fs.createDirectory(relative);
	}

	const awaitFiles = [];
	for (const path in json.files) {
		const data = json.files[path];
		const relative = env.fs.resolve(directory, path);

		const type = data.type == undefined ? "string" : data.type;

		switch (type) {
			case "string":
				awaitFiles.push(env.fs.writeFile(relative, data));
				break;
			case "binary":
				awaitFiles.push(env.fs.writeFile(relative, data.data));
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
