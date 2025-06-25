import { modulePreScript } from "./executables.js";
import { blobify } from "../lib/blobify.js";
import realFS from "../fs.js";
import { execute } from "./apps.js";

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
			await realFS.rmdir(directory);
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
			await realFS.deleteFile(directory);
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
			return {
				data: await realFS.stat(directory),
				ok: true
			};
		} catch (error) {
			return {
				data: error,
				ok: false
			};
		}
	},
	relative: realFS.relative
};

export async function include(directory: string): Promise<Object> {
	const content = await realFS.readFile(directory);

	const data = modulePreScript + content;

	const blob = blobify(data, "text/javascript");

	return await import(blob);
}

export const exec = execute;
