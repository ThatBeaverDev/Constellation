import { Stats } from "../../fs/BrowserFsTypes.js";
import { getParentDirectory } from "../io/fspath.js";
import { LatestFileIndex } from "../lib/packaging/definitions.js";
import { directoryPointType } from "../security/components/definitions.js";
import EnvFs, {
	FilesystemInterface
} from "../security/components/env/components/fs.js";

const archivesDirectory = "/System/CoreLibraries/archives";
let supportedArchiveTypes: string[] = [];
let lastUpdateToSupportedTypes = 0;

export async function getFilesystemInterface(rootFS: EnvFs, directory: string) {
	const points = directory.split("/").filter(Boolean);

	let path = "";
	let fs: FilesystemInterface = rootFS;

	for (const point of points) {
		path += "/" + point;

		if (await archiveTypeSupported(rootFS, path)) {
			fs = await getArchiveHandler(fs, path);
		}
	}

	return fs;
}

export async function getSupportedArchiveTypes(fs: EnvFs): Promise<string[]> {
	if (Date.now() - lastUpdateToSupportedTypes > 10000) {
		const list = await fs.listDirectory(archivesDirectory);

		supportedArchiveTypes = list
			.map((name) => name.textBefore("."))
			.filter(Boolean);
	}

	return supportedArchiveTypes;
}

export async function archiveTypeSupported(
	fs: EnvFs,
	path: string
): Promise<boolean> {
	const supported = await getSupportedArchiveTypes(fs);
	return supported.includes(path.textAfterAll("."));
}

export async function getArchiveHandler(fs: FilesystemInterface, path: string) {
	const contents = await fs.readFile(path);

	if (contents == undefined)
		throw new Error(
			`Cannot parse archive at ${path} because it does not exist.`
		);

	const filetype = path.textAfterAll(".");
	const parserDirectory = fs.resolve(archivesDirectory, filetype + ".js");

	const parser: (
		contents: string
	) => Promise<LatestFileIndex> | LatestFileIndex = (
		await fs.include(parserDirectory)
	).default;

	if (typeof parser !== "function")
		throw new Error(`No valid parser for archival type '${filetype}'`);

	const idx: LatestFileIndex = await parser(contents);
	if (idx == undefined) throw new Error("Parser returned undefined for idx.");

	const handler = new IndexFilesystemAPI(idx, fs, path, true);

	return handler;
}

class IndexFilesystemAPI implements FilesystemInterface {
	#readonly = true;
	#fs: FilesystemInterface;
	get isReadonly() {
		return Boolean(this.#readonly);
	}
	#directory: string;

	#systemPathToArchivePath(path: string): string {
		if (!path.startsWith(this.#directory)) {
			throw new Error(
				`Path (${path}) is not inside the archive! (archive at ${this.#directory})`
			);
		}

		const rel = path.textAfter(this.#directory);
		return rel === "" ? "/" : rel;
	}

	constructor(
		public idx: LatestFileIndex,
		fs: FilesystemInterface,
		directory: string,
		isReadonly: boolean
	) {
		this.#fs = fs;
		this.#readonly = isReadonly;
		this.#directory = directory;

		this.resolve = fs.resolve;
		this.relative = fs.relative;
	}

	async listDirectory(path: string) {
		const directory = this.#systemPathToArchivePath(path);

		const dirs = this.idx.directories;
		const dir = directory.at(-1) == "/" ? directory : directory + "/";

		const recursiveDirectoryChildren = dirs.filter(
			(item) => item.startsWith(dir) && item !== dir
		);

		const directoryChildren = recursiveDirectoryChildren
			.filter((item) => item.textAfter(dir).indexOf("/") == -1)
			.map((item) => item.textAfterAll("/"));

		const files = Object.keys(this.idx.files);
		const recursiveFileChildren = files.filter(
			(item) => item.startsWith(dir) && item !== dir
		);
		const fileChildren = recursiveFileChildren
			.filter((item) => item.textAfter(dir).indexOf("/") == -1)
			.map((item) => item.textAfterAll("/"));

		return [...directoryChildren, ...fileChildren];
	}

	async readFile(directory: string): Promise<string>;
	async readFile(
		directory: string,
		options: { encoding: "utf8" }
	): Promise<string>;
	async readFile(
		directory: string,
		options: { encoding: "binary" }
	): Promise<Uint8Array>;
	async readFile(
		directory: string,
		options?: { encoding: "utf8" | "binary" }
	): Promise<string | Uint8Array> {
		const path = this.#systemPathToArchivePath(directory);
		const file = this.idx.files[path];

		switch (options?.encoding) {
			case "binary":
				return new TextEncoder().encode(file.contents);

			case "utf8":
			default:
				return file.contents;
		}
	}

	async createDirectory(path: string): Promise<void> {
		const directory = this.#systemPathToArchivePath(path);

		const parent = getParentDirectory(directory);
		if (!this.idx.directories.includes(parent)) {
			throw new Error(
				`Parent directory, ${parent}, doesn't exist in index! (Creating ${directory} within ${this.#directory})`
			);
		}

		if (this.idx.directories.includes(directory)) {
			return;
		}

		return;
	}

	async deleteDirectory(path: string): Promise<void> {
		const directory = this.#systemPathToArchivePath(path);
		const children = await this.listDirectory(directory);

		if (children.length !== 0) {
			return;
		}

		const directoryIndex = this.idx.directories.indexOf(directory);
		if (directoryIndex !== -1)
			this.idx.directories.splice(directoryIndex, 1);
	}

	async writeFile(path: string, contents: string) {
		if (this.isReadonly) return;
		const directory = this.#systemPathToArchivePath(path);

		const file = this.idx.files[directory];

		file.contents = contents;
		file.modified = new Date();
	}

	async deleteFile(path: string): Promise<void> {
		const directory = this.#systemPathToArchivePath(path);

		if (this.idx.files[directory]) {
			delete this.idx.files[directory];
		}
	}

	async move(oldDirectory: string, newDirectory: string): Promise<void> {
		console.debug("move not implemented");
	}

	async copy(oldDirectory: string, newDirectory: string): Promise<void> {
		console.debug("copy not implemented");
	}

	async stat(path: string): Promise<Stats> {
		const handler = this;

		// @ts-expect-error
		const stats: Stats = {
			Dateblksize: 0,
			atime: new Date(),
			birthtime: new Date(),
			blocks: 0,
			ctime: new Date(),
			dev: 0,
			fileData: null,
			gid: 0,
			ino: 0,
			mode: 0,
			mtime: new Date(),
			nlink: 0,
			rdev: 0,
			size: 0,
			uid: 0,

			chmod() {},
			clone() {
				return stats;
			},

			isBlockDevice: () => false,
			isCharacterDevice: () => false,
			isFIFO: () => false,
			isSocket: () => false,
			isSymbolicLink: () => false,

			isDirectory() {
				return handler.#isDirectory(path) === true;
			},

			isFile() {
				return handler.#isDirectory(path) === false;
			}
		};

		return stats;
	}

	#isDirectory(path: string): boolean | undefined {
		const directory = this.#systemPathToArchivePath(path);

		if (directory === "/") return true;
		if (this.idx.files[directory] !== undefined) return false;
		if (this.idx.directories.includes(directory)) return true;

		return undefined;
	}

	async typeOfFile(path: string): Promise<directoryPointType> {
		let stat: Stats;

		try {
			stat = await this.stat(path);
		} catch {
			return "none";
		}

		if (stat.isDirectory()) return "directory";
		if (stat.isFile()) return "file";
		if (stat.isBlockDevice()) return "blockDevice";
		if (stat.isCharacterDevice()) return "characterDevice";
		if (stat.isFIFO()) return "FIFO";
		if (stat.isSocket()) return "socket";
		if (stat.isSymbolicLink()) return "symbolicLink";

		return "none";
	}

	resolve: (base: string, ...targets: string[]) => string;
	relative: (from: string, to: string) => string;

	async expectFileType(
		path: string,
		expectedType: directoryPointType
	): Promise<void> {
		const fileType = await this.typeOfFile(path);

		if (fileType !== expectedType) {
			throw new Error(
				"Filetype of " +
					path +
					" (" +
					fileType +
					") does not match expected: " +
					expectedType
			);
		}
	}

	pathAsDriveRoot(directory: string): string {
		return this.#fs.pathAsDriveRoot(directory);
	}

	async blobify(directory: string): Promise<string> {
		return "";
	}

	include = async (directory: string) => {
		return await this.#fs.include(directory);
	};
}

export async function archiveSafeReadfile(fs: EnvFs, directory: string) {
	const handler = await getFilesystemInterface(
		fs,
		getParentDirectory(directory)
	);

	return await handler.readFile(directory);
}

export async function archiveSafeStat(fs: EnvFs, directory: string) {
	const handler = await getFilesystemInterface(
		fs,
		getParentDirectory(directory)
	);

	return await handler.stat(directory);
}
