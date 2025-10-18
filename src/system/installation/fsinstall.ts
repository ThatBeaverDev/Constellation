import { installationTimestamp } from "./installationTimestamp.js";
import { InstallationError } from "../errors.js";
import { files, folders } from "./installation.config.js";
import ConstellationKernel from "..//kernel.js";
import { FilesystemAPI } from "../../fs/fs.js";
import { isCommandLine } from "../getPlatform.js";
import { tcupkg } from "../lib/packaging/tcupkg.js";

const path = "/System/installer/fsinstall.js";

export class FilesystemInstaller {
	fs: FilesystemAPI;
	#ConstellationKernel: ConstellationKernel;

	constructor(ConstellationKernel: ConstellationKernel) {
		this.#ConstellationKernel = ConstellationKernel;
		this.fs = ConstellationKernel.fs;
	}

	async install() {
		await this.rm_rf();
		await this.folders();
		await this.files();

		const config = JSON.parse(
			JSON.stringify(this.#ConstellationKernel.config)
		);

		// just so no programs can read it
		delete config.systemPassword;
		delete config.status;

		const configString = JSON.stringify(config);
		await this.fs.writeFile("/System/config.json", configString);
	}

	async rm_rf() {
		const fs = this.#ConstellationKernel.fs;

		async function walk(directory: string) {
			const list = await fs.readdir(directory);

			for (const item of list) {
				const resolved = fs.resolve(directory, item);

				const stat = await fs.stat(resolved);
				if (stat == undefined) return;

				if (stat.isDirectory()) {
					await walk(resolved);
				} else {
					await fs.unlink(resolved);
				}
			}

			await fs.rmdir(directory);
		}

		await walk("/");
	}

	async folders() {
		const start = performance.now();
		this.#ConstellationKernel.setBootStatus(`Creating Folders...`);

		for (const directory of folders) {
			const start = performance.now();
			await this.fs.mkdir(directory);
			installationTimestamp({ label: `Create ${directory}`, start });
		}

		installationTimestamp({
			label: "Create Directories",
			start,
			colour: "secondary"
		});
	}

	async downloadAndConvert(URL: string) {
		const start = performance.now();

		try {
			const response = await fetch(URL);
			if (!response.ok) {
				throw new InstallationError("Failed to download the file.");
			}
			const blob = await response.blob();
			const dataURL = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result);
				reader.onerror = () => reject(reader.error);
				reader.onabort = () => reject(new Error("Read aborted"));
				reader.readAsDataURL(blob);
			});
			installationTimestamp({
				label: `Download and Convert ${URL}`,
				start
			});
			return dataURL;
		} catch (error) {
			this.#ConstellationKernel.lib.logging.warn(path, error);
			installationTimestamp({
				label: `Download and Convert ${URL} [failed]`,
				start,
				colour: "error"
			});
			return null;
		}
	}
	async files() {
		const start = performance.now();

		const source = isCommandLine
			? async (location: string): Promise<string> => {
					const fs = await import("node:fs/promises");

					// make it relative if using absolute path
					const path = location[0] == "/" ? "." + location : location;

					return fs.readFile(path, { encoding: "utf8" });
				}
			: async (location: string): Promise<string> => {
					const req = await fetch(location);
					if (!req.ok) {
						throw new InstallationError(
							`Failed to fetch file from location ${location}`
						);
					}
					return await req.text();
				};

		this.#ConstellationKernel.setBootStatus(`Writing Files...`);

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

			downloadedContents[location] = response;

			installationTimestamp({
				label: `Retrieve File (${location})`,
				start,
				colour: "tertiary-dark"
			});
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
			switch (type) {
				case "text": {
					const start = performance.now();

					this.#ConstellationKernel.setBootStatus(
						`Cloning ${location}`
					);

					content = downloadedContents[location];

					writingWaitlist.push(this.fs.writeFile(directory, content));

					installationTimestamp({
						label: `Copy text file to ${directory}`,
						start,
						colour: "secondary-light"
					});

					break;
				}
				case "application": {
					if (directory.startsWith("/System/"))
						await this.#ConstellationKernel.security.permissions.setDirectoryPermission(
							directory,
							"systemFiles",
							true
						);
				}
				case "jsonFilesIndex": {
					const start = performance.now();

					this.#ConstellationKernel.setBootStatus(
						`Unpackaging ${location}`
					);

					content = downloadedContents[location];

					try {
						content = JSON.parse(content);
					} catch {
						this.#ConstellationKernel.lib.logging.error(
							path,
							`Package from URL '${location}' targeted for '${directory}' is not packaged properly.`
						);
					}

					// unpackage it using the kernel unpackager
					//writingWaitlist.push(
					await tcupkg(this.#ConstellationKernel, content, directory);
					//);

					installationTimestamp({
						label: `Unpackage idx for ${directory}`,
						start,
						colour: "secondary-light"
					});

					break;
				}
				case "binary": {
					const start = performance.now();

					this.#ConstellationKernel.setBootStatus(
						`Cloning and Encoding ${location}`
					);

					content = (await this.downloadAndConvert(
						location
					)) as string;

					writingWaitlist.push(this.fs.writeFile(directory, content));

					installationTimestamp({
						label: `Copy binary file to ${directory}`,
						start,
						colour: "secondary-light"
					});

					break;
				}
				default:
					throw new InstallationError("Unknown filetype: " + type);
			}
		}

		for (const i in writingWaitlist) {
			await writingWaitlist[i];
		}

		installationTimestamp({
			label: "Write Files",
			start,
			colour: "secondary"
		});
	}
}
