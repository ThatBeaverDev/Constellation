import { InstallationError } from "../errors.js";
import fs from "../fs.js";

import { files } from "./installation.config.js";

export async function writeFiles() {
	for (const location in files) {
		let directory;
		let type;
		switch (typeof files[location]) {
			case "string":
				directory = files[location];
				type = "text";
				break;
			case "object":
				directory = files[location].directory;
				type = files[location].type;
				break;
			default:
				throw new InstallationError("Unknown typeof item: " + location);
		}

		let content;
		let json;
		switch (type) {
			case "text":
				content = await (await fetch(location)).text();

				await fs.writeFile(directory, content);

				break;
			case "jsonFilesIndex":
				content = await (await fetch(location)).text();

				await fs.mkdir(directory);

				try {
					json = JSON.parse(content);
				} catch {
					console.error("Package from URL '" + location + "' targeted for '" + directory + "' is not packaged properly.");
				}

				for (const path of json.directories) {
					const relative = fs.relative(directory, path);

					await fs.mkdir(relative);
				}

				for (const path in json.files) {
					const data = json.files[path];
					const relative = fs.relative(directory, path);

					await fs.writeFile(relative, data);
				}

				break;
			default:
				throw new InstallationError("Unknown filetype: " + type);
		}
	}
}
