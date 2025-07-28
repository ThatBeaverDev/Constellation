import { setStatus } from "../constellation.config.js";
import { InstallationError } from "../errors.js";
import fs from "../io/fs.js";
import { installationTimestamp } from "./index.js";

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
	const start = performance.now();

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
	const start = performance.now();

	setStatus(`Installation : Writing Files...`);

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
			case "text": {
				const start = performance.now();

				setStatus(`Installation : Cloning ${location}`);

				const startNetwork = performance.now();
				content = await (await fetch(location)).text();
				installationTimestamp(
					"Download File",
					startNetwork,
					"tertiary-dark"
				);

				await fs.writeFile(directory, content);

				installationTimestamp(
					`Copy text file to ${directory}`,
					start,
					"secondary-light"
				);

				break;
			}
			case "jsonFilesIndex": {
				const start = performance.now();

				setStatus(`Installation : Unpackaging ${location}`);

				const startNetwork = performance.now();
				content = await (await fetch(location)).text();
				installationTimestamp(
					"Download package",
					startNetwork,
					"tertiary-dark"
				);

				const startDirectories = performance.now();

				await fs.mkdir(directory);

				try {
					json = JSON.parse(content);
				} catch {
					console.error(
						`Package from URL '${location}' targeted for '${directory}' is not packaged properly.`
					);
				}

				for (const path of json.directories) {
					const relative = fs.resolve(directory, path);

					await fs.mkdir(relative);
				}

				installationTimestamp(
					"Create directories",
					startDirectories,
					"secondary-dark"
				);
				const startFiles = performance.now();

				const awaitFiles = [];
				for (const path in json.files) {
					const data = json.files[path];
					const relative = fs.resolve(directory, path);

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

				installationTimestamp(
					"Write Files",
					startFiles,
					"secondary-dark"
				);

				if (json.files["postunpkg.js"] !== undefined) {
					const startPostUnpackagejs = performance.now();

					const incl = await env.include(
						fs.resolve(directory, "postunpkg.js")
					);

					const fnc = incl.default;

					if (typeof fnc == "function") {
						fnc(directory);
					}

					installationTimestamp(
						"Execute postunpkg.js file",
						startPostUnpackagejs,
						"secondary-dark"
					);
				}

				installationTimestamp(
					`Unpackage idx for ${directory}`,
					start,
					"secondary-light"
				);

				break;
			}
			case "binary": {
				const start = performance.now();

				setStatus(`Installation : Cloning and Encoding ${location}`);

				const startNetwork = performance.now();
				content = await downloadAndConvert(location);
				installationTimestamp(
					"Download package",
					startNetwork,
					"tertiary-dark"
				);

				await fs.writeFile(directory, content);

				installationTimestamp(
					`Copy binary file to ${directory}`,
					start,
					"secondary-light"
				);

				break;
			}
			default:
				throw new InstallationError("Unknown filetype: " + type);
		}
	}

	installationTimestamp("Write Files", start, "secondary");
}
