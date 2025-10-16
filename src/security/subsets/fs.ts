import { Stats } from "../../fs/BrowserFsTypes.js";
import { getParentDirectory } from "../../fs/fspath.js";
import ConstellationKernel from "../../kernel.js";
import {
	fsResponse,
	directoryPointType as directoryPoint
} from "../definitions.js";

export default class EnvFs {
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
		) => void
	) {
		this.#ConstellationKernel = ConstellationKernel;
		this.#directoryActionCheck = directoryActionCheck;

		this.resolve = ConstellationKernel.fs.resolve;
		this.relative = ConstellationKernel.fs.relative;
	}

	createDirectory = async (directory: string): Promise<fsResponse<true>> => {
		try {
			this.#directoryActionCheck(directory, true);

			await this.#ConstellationKernel.fs.mkdir(directory);
			return { data: true, ok: true };
		} catch (error: any) {
			return {
				data: error,
				ok: false
			};
		}
	};
	listDirectory = async (
		directory: string = "/"
	): Promise<fsResponse<string[]>> => {
		try {
			this.#directoryActionCheck(directory, false);

			const list = await this.#ConstellationKernel.fs.readdir(directory);
			return { data: list, ok: true };
		} catch (error: any) {
			return {
				data: error,
				ok: false
			};
		}
	};
	deleteDirectory = async (directory: string): Promise<fsResponse<true>> => {
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

			return {
				data: true,
				ok: true
			};
		} catch (error: any) {
			return {
				data: error,
				ok: false
			};
		}
	};

	writeFile = async (
		directory: string,
		contents: string
	): Promise<fsResponse<true>> => {
		try {
			this.#directoryActionCheck(directory, true);

			await this.#ConstellationKernel.fs.writeFile(directory, contents);
			return {
				data: true,
				ok: true
			};
		} catch (error: any) {
			return {
				data: error,
				ok: false
			};
		}
	};
	deleteFile = async (directory: string): Promise<fsResponse<true>> => {
		try {
			this.#directoryActionCheck(directory, true);

			await this.#ConstellationKernel.fs.unlink(directory);
			return {
				data: true,
				ok: true
			};
		} catch (error: any) {
			return {
				data: error,
				ok: false
			};
		}
	};
	readFile = async (directory: string): Promise<fsResponse<string>> => {
		try {
			this.#directoryActionCheck(directory, false);

			const content =
				await this.#ConstellationKernel.fs.readFile(directory);

			if (content == undefined) {
				throw new Error(`File at ${directory} does not exist!`);
			}

			return {
				data: content,
				ok: true
			};
		} catch (error: any) {
			return {
				data: error,
				ok: false
			};
		}
	};
	move = async (
		oldDirectory: string,
		newDirectory: string
	): Promise<fsResponse<void>> => {
		try {
			this.#directoryActionCheck(oldDirectory, true);
			this.#directoryActionCheck(newDirectory, true);

			return {
				data: await this.#ConstellationKernel.fs.rename(
					oldDirectory,
					newDirectory
				),
				ok: true
			};
		} catch (error: any) {
			return {
				data: error,
				ok: false
			};
		}
	};

	stat = async (directory: string): Promise<fsResponse<Stats>> => {
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

			return {
				data: stat,
				ok: true
			};
		} catch (error: any) {
			return {
				data: error,
				ok: false
			};
		}
	};
	typeOfFile = async (directory: string): Promise<directoryPoint | never> => {
		const parentDirectory = getParentDirectory(directory);
		this.#directoryActionCheck(parentDirectory, false);

		const stat = await this.stat(directory);

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
	};

	resolve = (base: string, ...targets: string[]): string => "/";
	relative = (from: string, to: string): string => "/";

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
}
