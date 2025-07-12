import { InstallationError } from "../errors.js";
import fs from "../io/fs.js";

import { files } from "./installation.config.js";

function blobToDataURL(blob: Blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = () => reject(reader.error);
		reader.onabort = () => reject(new Error("Read aborted"));
		reader.readAsDataURL(blob);
	});
}

async function downloadAndConvert(URL: string) {
	try {
		const response = await fetch(URL);
		if (!response.ok) {
			throw new Error("Failed to download the file.");
		}
		const blob = await response.blob();
		const dataURL = await blobToDataURL(blob);
		return dataURL;
	} catch (error) {
		console.warn(error);
		return null;
	}
}

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
			case "jsonFilesIndex": {
				content = await (await fetch(location)).text();

				await fs.mkdir(directory);

				try {
					json = JSON.parse(content);
				} catch {
					console.error(
						`Package from URL '${location}' targeted for '${directory}' is not packaged properly.`
					);
				}

				for (const path of json.directories) {
					const relative = fs.relative(directory, path);

					await fs.mkdir(relative);
				}

				const awaitFiles = [];
				for (const path in json.files) {
					const data = json.files[path];
					const relative = fs.relative(directory, path);

					const type = data.type == undefined ? "string" : data.type;

					switch (type) {
						case "string":
							awaitFiles.push(fs.writeFile(relative, data));
							break;
						case "binary":
							awaitFiles.push(fs.writeFile(relative, data.data));
							break;
						default:
							throw new Error(
								"Unknown key type within files object: '" +
									type +
									"'"
							);
					}
				}

				for (const item of awaitFiles) {
					await item;
				}

				break;
			}
			case "binary": {
				content = await downloadAndConvert(location);

				await fs.writeFile(directory, content);

				break;
			}
			default:
				throw new InstallationError("Unknown filetype: " + type);
		}
	}
}
