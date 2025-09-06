import { installationTimestamp } from "./index.js";
import { InstallationError } from "../errors.js";
import { files, folders } from "./installation.config.js";
import ConstellationKernel from "../kernel.js";
import { FilesystemAPI } from "../fs/fs.js";
import { isCommandLine } from "../getPlatform.js";

const path = "/System/installer/fsinstall.js";

export class FilesystemInstaller {
	fs: FilesystemAPI;
	#ConstellationKernel: ConstellationKernel;

	constructor(ConstellationKernel: ConstellationKernel) {
		this.#ConstellationKernel = ConstellationKernel;
		this.fs = ConstellationKernel.fs;
	}

	async rm_rf() {
		if (typeof window.indexedDB == "undefined") return; // smart feature detection

		const databases: IDBDatabaseInfo[] = await window.indexedDB.databases();

		for (const i in databases) {
			const database = databases[i];
			if (database.name == undefined) return;

			const DBDeleteRequest = window.indexedDB.deleteDatabase(
				database.name
			);

			DBDeleteRequest.onerror = (event) => {
				this.#ConstellationKernel.lib.logging.error(
					path,
					`Error deleting database ${database.name}.`
				);
			};

			DBDeleteRequest.onsuccess = (event) => {
				this.#ConstellationKernel.lib.logging.log(
					path,
					`Database ${database.name} deleted successfully`
				);
			};
		}
	}

	async folders() {
		const start = performance.now();
		this.#ConstellationKernel.config.setStatus(
			`Installation: Creating Folders...`
		);

		for (const directory of folders) {
			const start = performance.now();
			await this.fs.mkdir(directory);
			installationTimestamp(`Create ${directory}`, start);
		}

		installationTimestamp("Create Directories", start, "secondary");
	}

	async downloadAndConvert(URL: string) {
		const start = performance.now();

		try {
			const response = await fetch(URL);
			if (!response.ok) {
				throw new Error("Failed to download the file.");
			}
			const blob = await response.blob();
			const dataURL = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result);
				reader.onerror = () => reject(reader.error);
				reader.onabort = () => reject(new Error("Read aborted"));
				reader.readAsDataURL(blob);
			});
			installationTimestamp(`Download and Convert ${URL}`, start);
			return dataURL;
		} catch (error) {
			this.#ConstellationKernel.lib.logging.warn(path, error);
			installationTimestamp(
				`Download and Convert ${URL} [failed]`,
				start,
				"error"
			);
			return null;
		}
	}
	async files() {
		const start = performance.now();

		const source = isCommandLine
			? async (location: string): Promise<string> => {
					// @ts-expect-error
					const fs = await import("node:fs/promises");

					// make it relative if using absolute path
					const path = location[0] == "/" ? "." + location : location;

					return fs.readFile(path, { encoding: "utf8" });
				}
			: async (location: string): Promise<string> => {
					return await (await fetch(location)).text();
				};

		this.#ConstellationKernel.config.setStatus(
			`Installation: Writing Files...`
		);

		// download everything simultaneously
		const downloadingContents: Record<string, Promise<string>> = {};
		for (const location in files) {
			downloadingContents[location] = source(location);
		}

		// wait for it all to download and become text simultaneously
		const downloadedContents: Record<string, string> = {};

		for (const location in files) {
			const start = performance.now();

			const response = await downloadingContents[location];

			//if (!response.ok) {
			//	installationTimestamp("Download File [failed]", start, "error");
			//	throw new Error(`File failed to download: ${location}`);
			//}

			downloadedContents[location] = response;

			installationTimestamp(
				`Retrieve File (${location})`,
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

					this.#ConstellationKernel.config.setStatus(
						`Installation: Cloning ${location}`
					);

					content = downloadedContents[location];

					writingWaitlist.push(this.fs.writeFile(directory, content));

					installationTimestamp(
						`Copy text file to ${directory}`,
						start,
						"secondary-light"
					);

					break;
				}
				case "jsonFilesIndex": {
					const start = performance.now();

					this.#ConstellationKernel.config.setStatus(
						`Installation: Unpackaging ${location}`
					);

					content = downloadedContents[location];

					const startDirectories = performance.now();

					this.#ConstellationKernel.lib.logging.warn(path, directory);
					await this.fs.mkdir(directory);

					try {
						json = JSON.parse(content);
					} catch {
						this.#ConstellationKernel.lib.logging.error(
							path,
							`Package from URL '${location}' targeted for '${directory}' is not packaged properly.`
						);
					}

					for (const path of json.directories) {
						const relative = this.fs.resolve(directory, path);

						await this.fs.mkdir(relative);
					}

					installationTimestamp(
						"Create directories",
						startDirectories,
						"secondary-dark"
					);
					const startFiles = performance.now();

					for (const path in json.files) {
						const data = json.files[path];
						const relative = this.fs.resolve(directory, path);

						const type =
							data.type == undefined ? "string" : data.type;

						switch (type) {
							case "string":
								writingWaitlist.push(
									this.fs.writeFile(relative, data)
								);
								break;
							case "binary":
								writingWaitlist.push(
									this.fs.writeFile(relative, data.data)
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

					this.#ConstellationKernel.config.setStatus(
						`Installation: Cloning and Encoding ${location}`
					);

					content = (await this.downloadAndConvert(
						location
					)) as string;

					writingWaitlist.push(this.fs.writeFile(directory, content));

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
}
