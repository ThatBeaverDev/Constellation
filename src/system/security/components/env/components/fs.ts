import ConstellationKernel from "../../../../kernel.js";
import { getParentDirectory } from "../../../../io/fspath.js";
import { directoryPointType as directoryPoint } from "../../definitions.js";
import { Stats } from "../../../../../fs/BrowserFsTypes.js";

export interface FilesystemInterface {
	createDirectory(directory: string): Promise<void>;
	listDirectory(directory: string): Promise<string[]>;
	deleteDirectory(directory: string): Promise<void>;

	writeFile(directory: string, contents: string): Promise<void>;
	deleteFile(directory: string): Promise<void>;
	move(oldDirectory: string, newDirectory: string): Promise<void>;

	readFile(directory: string): Promise<string>;

	copy(oldDirectory: string, newDirectory: string): Promise<void>;

	stat(directory: string): Promise<Stats>;
	typeOfFile(directory: string): Promise<directoryPoint | never>;

	resolve(base: string, ...targets: string[]): string;
	relative(from: string, to: string): string;

	blobify(directory: string): Promise<string>;

	expectFileType(directory: string, expectedType: directoryPoint): void;

	pathAsDriveRoot(directory: string): string;

	include(directory: string): any;
}

export default class EnvFs implements FilesystemInterface {
	#ConstellationKernel: ConstellationKernel;
	#directoryActionCheck: (
		directory: string,
		isWriteOperation: boolean
	) => void;

	constructor(
		ConstellationKernel: ConstellationKernel,
		directoryActionCheck: (
			directory: string,
			isWriteOperation: boolean
		) => void,
		directory: string,
		user: string
	) {
		this.#ConstellationKernel = ConstellationKernel;
		this.#directoryActionCheck = directoryActionCheck;

		this.resolve = (base: string, ...targets: string[]) => {
			const process = (path: string): string => {
				if (path == "~") {
					return this.#ConstellationKernel.security.users.getUser(
						user
					).directory;
				} else if (path.substring(0, 1) == "~/") {
					return (
						this.#ConstellationKernel.security.users.getUser(user)
							.directory + path.substring(2)
					);
				} else {
					return path;
				}
			};

			const processedBase = process(base);
			const processedTargets = targets.map((target) => process(target));

			return ConstellationKernel.fs.resolve(
				directory,
				processedBase,
				...processedTargets
			);
		};
		this.relative = ConstellationKernel.fs.relative;
	}

	createDirectory = async (directory: string) => {
		try {
			this.#directoryActionCheck(directory, true);

			await this.#ConstellationKernel.fs.mkdir(directory);
		} catch (error: any) {
			error.message = "env.fs.createDirectory: " + error.message;
			throw error;
		}
	};
	listDirectory = async (directory: string): Promise<string[]> => {
		try {
			this.#directoryActionCheck(directory, false);

			const list = await this.#ConstellationKernel.fs.readdir(directory);
			return list;
		} catch (error: any) {
			error.message = "env.fs.listDirectory: " + error.message;
			throw error;
		}
	};
	deleteDirectory = async (directory: string): Promise<void> => {
		try {
			this.#directoryActionCheck(directory, true);

			let err: Error | undefined;
			await this.#ConstellationKernel.fs.rmdir(directory);

			if (err !== undefined && err !== null) {
				// @ts-expect-error
				switch (err.code) {
					case "ENOTEMPTY":
						throw new Error("Directory is not empty!");
					default:
						throw err;
				}
			}
		} catch (error: any) {
			error.message = "env.fs.deleteDirectory: " + error.message;
			throw error;
		}
	};

	writeFile = async (directory: string, contents: string): Promise<void> => {
		try {
			this.#directoryActionCheck(directory, true);

			await this.#ConstellationKernel.fs.writeFile(directory, contents);
		} catch (error: any) {
			error.message = "env.fs.writeFile: " + error.message;
			throw error;
		}
	};
	deleteFile = async (directory: string): Promise<void> => {
		try {
			this.#directoryActionCheck(directory, true);

			await this.#ConstellationKernel.fs.unlink(directory);
		} catch (error: any) {
			error.message = "env.fs.deleteFile: " + error.message;
			throw error;
		}
	};

	async readFile(directory: string): Promise<string> {
		try {
			this.#directoryActionCheck(directory, false);

			const content =
				await this.#ConstellationKernel.fs.readFile(directory);

			if (content == undefined) {
				throw new Error(`File at ${directory} does not exist!`);
			}

			return content;
		} catch (error: any) {
			error.message = "env.fs.readFile: " + error.message;
			throw error;
		}
	}
	move = async (
		oldDirectory: string,
		newDirectory: string
	): Promise<void> => {
		try {
			this.#directoryActionCheck(oldDirectory, true);
			this.#directoryActionCheck(newDirectory, true);

			await this.#ConstellationKernel.fs.rename(
				oldDirectory,
				newDirectory
			);
		} catch (error: any) {
			error.message = "env.fs.move: " + error.message;
			throw error;
		}
	};

	copy = async (
		oldDirectory: string,
		newDirectory: string
	): Promise<void> => {
		try {
			this.#directoryActionCheck(oldDirectory, true);
			this.#directoryActionCheck(newDirectory, true);

			await this.#ConstellationKernel.fs.cp(oldDirectory, newDirectory);
		} catch (error: any) {
			error.message = "env.fs.copy: " + error.message;
			throw error;
		}
	};

	stat = async (directory: string): Promise<Stats> => {
		try {
			const parentDirectory = getParentDirectory(directory);
			this.#directoryActionCheck(parentDirectory, false);

			const stat = await this.#ConstellationKernel.fs.stat(directory);

			if (stat == undefined) {
				throw new Error(
					directory +
						" does not exist and therefore cannot be 'statted'"
				);
			}

			return stat;
		} catch (error: any) {
			error.message = "env.fs.stat: " + error.message;
			throw error;
		}
	};
	typeOfFile = async (directory: string): Promise<directoryPoint | never> => {
		const parentDirectory = getParentDirectory(directory);
		this.#directoryActionCheck(parentDirectory, false);

		let stat: Stats;
		try {
			stat = await this.stat(directory);
		} catch {
			return "none";
		}

		const isBlockDevice = stat.isBlockDevice();
		const isCharacterDevice = stat.isCharacterDevice();
		const isDirectory = stat.isDirectory();
		const isFIFO = stat.isFIFO();
		const isFile = stat.isFile();
		const isSocket = stat.isSocket();
		const isSymbolicLink = stat.isSymbolicLink();

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
	};

	resolve = (base: string, ...targets: string[]): string => "/";
	relative = (from: string, to: string): string => "/";

	async blobify(directory: string) {
		return await this.#ConstellationKernel.lib.blobifier.blobifyDirectory(
			directory
		);
	}

	expectFileType = async (
		directory: string,
		expectedType: directoryPoint
	) => {
		this.#directoryActionCheck(directory, false);

		const fileType = await this.typeOfFile(directory);

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

	pathAsDriveRoot = (directory: string) => {
		const kernel = this.#ConstellationKernel;

		return kernel.fs.resolve(kernel.rootPoint, directory);
	};

	async include(directory: string): Promise<any> {
		let url = directory;

		this.#directoryActionCheck(directory, false);

		let type = directory.includes("://") ? "URL" : "directory";

		switch (type) {
			case "directory":
				const blob =
					await this.#ConstellationKernel.runtime.importsRewriter.resolve(
						directory
					);

				return await import(blob);
			case "URL":
				const exports = await import(url.toString());

				return exports;
		}
	}
}
