import { developmentLogging } from "../constellation.config.js";
import * as conf from "../constellation.config.js";
import { blobifyDirectory } from "../lib/blobify.js";
import realFS from "../io/fs.js";
import { execute, showPrompt } from "./apps.js";
import { ImportError, PermissionsError } from "../errors.js";
import { windows } from "../windows/windows.js";
import {
	DirectoryPermissionStats,
	getDirectoryPermissions,
	getFilesDomainOfDirectory
} from "./permissions.js";

// Types

type fsResponse = {
	data: any;
	ok: Boolean;
};

type directoryPointType =
	| "blockDevice"
	| "characterDevice"
	| "directory"
	| "FIFO"
	| "file"
	| "socket"
	| "symbolicLink"
	| "none";

export type windowAlias = {
	move: Function;
	resize: Function;

	minimise: Function;
	unminimise: Function;

	show: Function;
	hide: Function;

	showHeader: Function;
	hideHeader: Function;

	name: string;
	iconName: string;
	winID: number;

	position: {
		left: number;
		top: number;
		zIndex: number;
	};
	dimensions: {
		width: number;
		height: number;
	};
};

export const associations: any = {};

export class ApplicationAuthorisationAPI {
	constructor(directory: string, user: string) {
		this.directory = directory;
		this.permissions = getDirectoryPermissions(this.directory);
		this.user = user;
	}

	readonly directory: string;
	readonly permissions: DirectoryPermissionStats;
	readonly user: string;

	// logging
	debug(initiator: string, ...content: any): undefined {
		console.debug("[" + initiator + "] -", ...content);
	}
	log(initiator: string, ...content: any): undefined {
		console.log("[" + initiator + "] -", ...content);
	}
	warn(initiator: string, ...content: any): undefined {
		console.warn("[" + initiator + "] -", ...content);
	}
	error(initiator: string, ...content: any): undefined {
		console.error("[" + initiator + "] -", ...content);
	}

	prompt(text: string, reason = "") {
		showPrompt("log", text, reason);
	}

	private _directoryActionCheck(
		directory: string,
		isWriteOperation: boolean
	) {
		const domainType = getFilesDomainOfDirectory(directory, this.user);
		switch (domainType) {
			case "global":
				// all good
				break;
			case "user":
				if (isWriteOperation && this.permissions.userFiles == false) {
					throw new PermissionsError(
						`Permission denied in action upon ${directory} - domain ${domainType}, isWriteOperation: ${isWriteOperation}`
					);
				}
				break;
			case "system":
				if (isWriteOperation && this.permissions.systemFiles == false) {
					throw new PermissionsError(
						`Permission denied in action upon ${directory} - domain ${domainType}, isWriteOperation: ${isWriteOperation}`
					);
				}
				break;
		}
	}

	fs: any = {
		createDirectory: async (directory: string): Promise<fsResponse> => {
			try {
				this._directoryActionCheck(directory, true);

				await realFS.mkdir(directory);
				return { data: true, ok: true };
			} catch (error) {
				return {
					data: error,
					ok: false
				};
			}
		},
		listDirectory: async (directory: string = "/"): Promise<fsResponse> => {
			try {
				this._directoryActionCheck(directory, false);

				const list = await realFS.readdir(directory);
				return { data: list, ok: true };
			} catch (error) {
				return {
					data: error,
					ok: false
				};
			}
		},
		deleteDirectory: async (directory: string): Promise<fsResponse> => {
			try {
				this._directoryActionCheck(directory, true);

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

		writeFile: async (
			directory: string,
			contents: string
		): Promise<fsResponse> => {
			try {
				this._directoryActionCheck(directory, true);

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
		deleteFile: async (directory: string): Promise<fsResponse> => {
			try {
				this._directoryActionCheck(directory, true);

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
		readFile: async (directory: string): Promise<fsResponse> => {
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

		stat: async (directory: string): Promise<fsResponse> => {
			try {
				this._directoryActionCheck(directory, false);

				const stat = await realFS.stat(directory);

				if (stat == undefined) {
					throw new Error(
						directory + " has no file and cannot be 'statted'"
					);
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
		typeOfFile: async (directory: string): Promise<directoryPointType> => {
			const stat = await this.fs.stat(directory);

			if (!stat.ok) {
				return "none";
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

			return "none"; // no idea to be honest
		},
		relative: (base: string, child: string): string => {
			return realFS.relative(base, child);
		}
	};

	expectFileType = async (
		directory: string,
		expectedType: directoryPointType
	) => {
		const fileType = await this.fs.typeOfFile(directory);

		if (fileType !== expectedType) {
			throw new Error(
				"Filetype of " +
					directory +
					" (" +
					fileType +
					") does not match expected: " +
					expectedType
			);
		}
	};

	async include(location: string): Promise<any> {
		let url = location;

		this._directoryActionCheck(location, false);

		let type = location.includes("://") ? "URL" : "directory";

		if (developmentLogging)
			console.debug("Inclusion of '" + location + "'");

		// @ts-expect-error
		if (conf.importOverrides[location] !== undefined) {
			type = "URL";
			// @ts-expect-error
			url = conf.importOverrides[location];
		}

		switch (type) {
			case "directory":
				url = await blobifyDirectory(location, "text/javascript");
				break;
		}

		const exports = await import(url);

		return exports;
	}

	exec = execute;
	getPIDOfName(name: string): number | undefined {
		return associations[name];
	}

	allWindows(): windowAlias[] {
		if (this.permissions.windows !== true)
			throw new PermissionsError(
				"Application " +
					this.directory +
					" does not have sufficient permissions for API 'windows'."
			);

		const obj: windowAlias[] = [];

		for (const win of windows) {
			const wn: windowAlias = {
				move: win.move.bind(win),
				resize: win.resize.bind(win),

				minimise: win.minimise.bind(win),
				unminimise: win.unminimise.bind(win),

				show: win.show.bind(win),
				hide: win.hide.bind(win),

				showHeader: win.showHeader.bind(win),
				hideHeader: win.hideHeader.bind(win),

				name: win.name,
				iconName: win.iconName,

				position: win.position,
				dimensions: win.dimensions,

				winID: win.winID
			};

			obj.push(wn);
		}

		return obj;
	}
}
