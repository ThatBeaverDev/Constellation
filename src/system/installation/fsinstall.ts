import { InstallationError } from "../errors.js";
import {
	files,
	folders,
	installerFileEntryType
} from "./installation.config.js";
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

	async install(isSoftwareUpdate: boolean) {
		await this.rm_rf(isSoftwareUpdate);
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

	async rm_rf(isUpdate: boolean = false) {
		const fs = this.#ConstellationKernel.fs;

		const rmdir = async (directory: string) => {
			const list = await fs.readdir(directory);

			if (list == undefined) {
				this.#ConstellationKernel.lib.logging.warn(
					path,
					`Directory ${directory} is being skipped because it supposedly has no contents (it does exist though)`
				);
				return false;
			}

			let hasFoundJSONFile = false;

			for (const item of list) {
				const resolved = fs.resolve(directory, item);

				const stat = await fs.stat(resolved);
				if (stat == undefined) continue;

				if (stat.isDirectory()) {
					const hasJson = await rmdir(resolved);

					if (hasJson) {
						hasFoundJSONFile = true;
					}
				} else {
					if (item.endsWith(".json") && isUpdate) {
						hasFoundJSONFile = true;
						continue;
					}

					await fs.unlink(resolved);
				}
			}

			if (!hasFoundJSONFile || !isUpdate) {
				await fs.rmdir(directory);
			}

			return hasFoundJSONFile;
		};

		if (isUpdate) {
			await rmdir("/System");
		} else {
			await rmdir("/");
		}
	}

	async folders() {
		this.#ConstellationKernel.setBootStatus(`Creating Folders...`);

		for (const directory of folders) {
			await this.fs.mkdir(directory);
		}
	}

	async downloadAndConvert(URL: string) {
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
			return dataURL;
		} catch (error) {
			this.#ConstellationKernel.lib.logging.warn(path, error);
			return null;
		}
	}
	async files() {
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
			const response = await downloadingContents[location];

			downloadedContents[location] = response;
		}

		const writingWaitlist: Promise<any>[] = [];

		for (const location in files) {
			const obj = files[location];
			let directory: string;
			let type: installerFileEntryType;
			if (typeof obj == "string") {
				type = "text";
				directory = obj;
			} else {
				type = obj.type;
				directory = obj.directory;
			}

			let content;
			switch (type) {
				case "text": {
					this.#ConstellationKernel.setBootStatus(
						`Cloning ${location}`
					);

					content = downloadedContents[location];

					writingWaitlist.push(this.fs.writeFile(directory, content));

					break;
				}
				case "application":
				case "jsonFilesIndex": {
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

					break;
				}
				case "binary": {
					this.#ConstellationKernel.setBootStatus(
						`Cloning and Encoding ${location}`
					);

					content = (await this.downloadAndConvert(
						location
					)) as string;

					writingWaitlist.push(this.fs.writeFile(directory, content));

					break;
				}
				default:
					throw new InstallationError("Unknown filetype: " + type);
			}
		}

		for (const i in writingWaitlist) {
			await writingWaitlist[i];
		}

		for (const location in files) {
			const obj = files[location];
			if (typeof obj == "string") continue;
			const { type, directory } = obj;

			if (type == "application") {
				if (directory.startsWith("/System/"))
					await this.#ConstellationKernel.security.permissions.setDirectoryPermission(
						directory,
						"systemFiles",
						true
					);
			}
		}
	}
}
