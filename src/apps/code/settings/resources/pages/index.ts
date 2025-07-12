export const list = ["home", "windows"];

export default async function (parent: any) {
	const result: any = {};

	for (const page of list) {
		const data = await env.include(
			env.fs.relative(parent.directory, "resources/pages/" + page + ".js")
		);

		if (typeof data.init == "function") {
			data.init(parent);
		}

		result[page] = data.default;
	}

	return result;
}
