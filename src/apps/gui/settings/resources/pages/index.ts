import systemSettings from "../../tcpsys/app.js";

export const list = ["home", "windows"];

export default async function (parent: systemSettings) {
	const result: Record<string, any> = {};

	for (const page of list) {
		const data = await parent.env.include(
			parent.env.fs.resolve(
				parent.directory,
				"resources/pages/" + page + ".js"
			)
		);

		if (typeof data.init == "function") {
			data.init(parent);
		}

		result[page] = data.default;
	}

	return result;
}
