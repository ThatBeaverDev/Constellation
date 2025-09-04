import { setStatus } from "../../constellation.config.js";
import { InstallationError } from "../../errors.js";
import fs from "../../io/fs.js";
import uiKitCreators from "../../lib/uiKit/creators.js";
import { installationTimestamp } from "../index.js";

import { files } from "../installation.config.js";

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
		installationTimestamp(`Download and Convert ${URL}`, start);
		return dataURL;
	} catch (error) {
		console.warn(error);
		installationTimestamp(
			`Download and Convert ${URL} [failed]`,
			start,
			"error"
		);
		return null;
	}
}

export async function writeFiles() {
	const start = performance.now();

	setStatus(`Installation: Writing Files...`);

	// download everything simultaneously
	const downloadingContents: Record<string, Promise<Response>> = {};
	for (const location in files) {
		downloadingContents[location] = fetch(location);
	}

	// wait for it all to download and become text simultaneously
	const downloadedContents: Record<string, string> = {};

	for (const location in files) {
		const start = performance.now();

		const response = await downloadingContents[location];

		if (!response.ok) {
			installationTimestamp("Download File [failed]", start, "error");
			throw new Error(`File failed to download: ${location}`);
		}

		downloadedContents[location] = await response.text();

		installationTimestamp(
			`Download File (${location})`,
			start,
			"tertiary-dark"
		);
	}

	const writingWaitlist: Promise<any>[] = [];

	for (const location in files) {
		const obj = files[location];
		let directory;
		let type;
		if (typeof obj == "string") {
			directory = obj;
			type = "text";
		} else if (typeof obj == "object") {
			directory = obj.directory;
			type = obj.type;
		} else {
			throw new InstallationError("Unknown typeof item: " + location);
		}

		let content;
		let json;
		switch (type) {
			case "text": {
				const start = performance.now();

				setStatus(`Installation: Cloning ${location}`);

				content = downloadedContents[location];

				writingWaitlist.push(fs.writeFile(directory, content));

				installationTimestamp(
					`Copy text file to ${directory}`,
					start,
					"secondary-light"
				);

				break;
			}
			case "jsonFilesIndex": {
				const start = performance.now();

				setStatus(`Installation: Unpackaging ${location}`);

				content = downloadedContents[location];

				const startDirectories = performance.now();

				console.warn(directory);
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

				for (const path in json.files) {
					const data = json.files[path];
					const relative = fs.resolve(directory, path);

					const type = data.type == undefined ? "string" : data.type;

					switch (type) {
						case "string":
							writingWaitlist.push(fs.writeFile(relative, data));
							break;
						case "binary":
							writingWaitlist.push(
								fs.writeFile(relative, data.data)
							);
							break;
						default:
							throw new Error(
								"Unknown key type within files object: '" +
									type +
									"'"
							);
					}
				}

				installationTimestamp(
					"Write Files",
					startFiles,
					"secondary-dark"
				);

				installationTimestamp(
					`Unpackage idx for ${directory}`,
					start,
					"secondary-light"
				);

				break;
			}
			case "binary": {
				const start = performance.now();

				setStatus(`Installation: Cloning and Encoding ${location}`);

				content = (await downloadAndConvert(location)) as string;

				writingWaitlist.push(fs.writeFile(directory, content));

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

	for (const i in writingWaitlist) {
		await writingWaitlist[i];
	}

	installationTimestamp("Write Files", start, "secondary");
}
