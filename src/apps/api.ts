import conf from "../constellation.config.js";
import { blobify } from "../lib/blobify.js";
import realFS from "../fs.js";
import { execute } from "./apps.js";
import { ImportError } from "../errors.js";

// logging

export function debug(initiator: any, text: string): undefined {}
export function log(initiator: any, text: string): undefined {}
export function warn(initiator: any, text: string): undefined {}
export function error(initiator: any, text: string): undefined {}

type fsResponse = {
	data: any;
	ok: Boolean;
};

export const fs = {
	createDirectory: async function (directory: string): Promise<fsResponse> {
		try {
			await realFS.mkdir(directory);
			return { data: true, ok: true };
		} catch (error) {
			return {
				data: error,
				ok: false
			};
		}
	},
	listDirectory: async function (directory: string = "/"): Promise<fsResponse> {
		try {
			const list = await realFS.readdir(directory);
			return { data: list, ok: true };
		} catch (error) {
			return {
				data: error,
				ok: false
			};
		}
	},
	deleteDirectory: async function (directory: string): Promise<fsResponse> {
		try {
			let err: Error | undefined;
			await realFS.rmdir(directory, (e: Error) => {
				err = e;
			});

			if (err !== undefined && err !== null) {
				// @ts-expect-error
				switch (err.code) {
					case "ENOTEMPTY":
						throw new Error("Directory is not empty!");
					default:
						throw err;
				}
			}

			return {
				data: true,
				ok: true
			};
		} catch (error) {
			return {
				data: error,
				ok: false
			};
		}
	},

	createFile: async function (directory: string): Promise<fsResponse> {
		try {
			await expectFileType(directory, undefined);

			await realFS.writeFile(directory, "");
			return {
				data: true,
				ok: true
			};
		} catch (error) {
			return {
				data: error,
				ok: false
			};
		}
	},
	updateFile: async function (directory: string, contents: string): Promise<fsResponse> {
		try {
			const file = await fs.stat(directory);

			if (!file.ok) {
				return {
					data: "File at " + directory + " does not exist.",
					ok: false
				};
			}

			await realFS.writeFile(directory, contents);
			return {
				data: true,
				ok: true
			};
		} catch (error) {
			return {
				data: error,
				ok: false
			};
		}
	},
	deleteFile: async function (directory: string): Promise<fsResponse> {
		try {
			await realFS.unlink(directory);
			return {
				data: true,
				ok: true
			};
		} catch (error) {
			return {
				data: error,
				ok: false
			};
		}
	},
	readFile: async function (directory: string): Promise<fsResponse> {
		try {
			return {
				data: await realFS.readFile(directory),
				ok: true
			};
		} catch (error) {
			return {
				data: error,
				ok: false
			};
		}
	},

	stat: async function (directory: string): Promise<fsResponse> {
		try {
			const stat = await realFS.stat(directory);

			if (stat == undefined) {
				throw new Error(directory + " has no file and cannot be 'statted'");
			}

			return {
				data: stat,
				ok: true
			};
		} catch (error) {
			return {
				data: error,
				ok: false
			};
		}
	},
	relative: function (base: string, child: string): string {
		return realFS.relative(base, child);
	}
};

type directoryPointType = "blockDevice" | "characterDevice" | "directory" | "FIFO" | "file" | "socket" | "symbolicLink" | undefined;

const typeOfFile = async (directory: string): Promise<directoryPointType> => {
	const stat = await fs.stat(directory);

	if (!stat.ok) {
		return undefined;
	}

	const st = stat.data;

	const isBlockDevice = st.isBlockDevice();
	const isCharacterDevice = st.isCharacterDevice();
	const isDirectory = st.isDirectory();
	const isFIFO = st.isFIFO();
	const isFile = st.isFile();
	const isSocket = st.isSocket();
	const isSymbolicLink = st.isSymbolicLink();

	if (isBlockDevice) {
		return "blockDevice";
	}
	if (isCharacterDevice) {
		return "characterDevice";
	}
	if (isDirectory) {
		return "directory";
	}
	if (isFIFO) {
		return "FIFO";
	}
	if (isFile) {
		return "file";
	}
	if (isSocket) {
		return "socket";
	}
	if (isSymbolicLink) {
		return "symbolicLink";
	}

	return undefined;
};
const expectFileType = async (directory: string, expectedType: directoryPointType) => {
	const fileType = await typeOfFile(directory);

	if (fileType !== expectedType) {
		throw new Error("Filetype of " + directory + " (" + fileType + ") does not match expected: " + expectedType);
	}
};

// @ts-expect-error
setTimeout(() => (window.abab = typeOfFile("/System")), 2500);

export async function include(location: string): Promise<Object> {
	let url = location;

	let type = location.includes("://") ? "URL" : "directory";

	// @ts-expect-error
	if (conf.importOverrides[location] !== undefined) {
		type = "URL";
		// @ts-expect-error
		url = conf.importOverrides[location];
	}

	switch (type) {
		case "directory":
			const content = await realFS.readFile(location);

			if (content == undefined) {
				throw new ImportError("Import source is empty at '" + location + "'");
			}

			url = blobify(content, "text/javascript");
			break;
	}

	const exports = await import(url);

	return exports;
}

export const exec = execute;
