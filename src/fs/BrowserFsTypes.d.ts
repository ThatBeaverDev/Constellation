export interface BrowserFS {
	BFSRequire(module: "fs"): FSModule;
	BFSRequire(module: "path"): "path";
	BFSRequire(module: "buffer"): "buffer";
	BFSRequire(module: "bfs_utils"): "core/util";
	BFSRequire(module: string): any;

	/**
	 * Creates a file system with the given configuration, and initializes BrowserFS with it.
	 * See the FileSystemConfiguration type for more info on the configuration object.
	 */
	configure: (config: FileSystemConfiguration, cb: BFSOneArgCallback) => void;
	getFileSystem(
		config: FileSystemConfiguration,
		cb: BFSCallback<FileSystem>
	): void;

	/**
	 * Initializes BrowserFS with the given root file system.
	 */
	initialise(rootfs: FileSystem): FileSystem;
	/**
	 * Installs BFSRequire as global require, a Node Buffer polyfill as the global Buffer variable, and a Node process polyfill as the global process variable.
	 */
	install(obj: any): void;
}

export interface FileSystemConfiguration {
	fs:
		| "AsyncMirror"
		| "Dropbox"
		| "Emscripten"
		| "FolderAdapter"
		| "HTML5FS"
		| "IndexedDB"
		| "InMemory"
		| "IsoFS"
		| "LocalStorage"
		| "MountableFileSystem"
		| "OverlayFS"
		| "XmlHttpRequest"
		| "WorkerFS"
		| "ZipFS";
	options: any;
}

export type BFSOneArgCallback = (e?: ApiError | null) => any;
export type BFSCallback<T> = (e: ApiError | null | undefined, rv?: T) => any;
export type BFSThreeArgCallback<T, U> = (
	e: ApiError | null | undefined,
	arg1?: T,
	arg2?: U
) => any;

/**
 * Standard libc error codes. Add more to this enum and ErrorStrings as they are
 * needed.
 * @url http://www.gnu.org/software/libc/manual/html_node/Error-Codes.html
 */
export enum ErrorCode {
	EPERM = 1,
	ENOENT = 2,
	EIO = 5,
	EBADF = 9,
	EACCES = 13,
	EBUSY = 16,
	EEXIST = 17,
	ENOTDIR = 20,
	EISDIR = 21,
	EINVAL = 22,
	EFBIG = 27,
	ENOSPC = 28,
	EROFS = 30,
	ENOTEMPTY = 39,
	ENOTSUP = 95
}
/* tslint:disable:variable-name */
/**
 * Strings associated with each error code.
 * @hidden
 */

/* tslint:enable:variable-name */

/**
 * Represents a BrowserFS error. Passed back to applications after a failed
 * call to the BrowserFS API.
 */
export class ApiError extends Error {
	public static fromJSON(json: any): ApiError;

	public static FileError(code: ErrorCode, p: string): ApiError;
	public static ENOENT(path: string): ApiError;

	public static EEXIST(path: string): ApiError;

	public static EISDIR(path: string): ApiError;

	public static ENOTDIR(path: string): ApiError;

	public static EPERM(path: string): ApiError;

	public static ENOTEMPTY(path: string): ApiError;

	public errno: ErrorCode;
	public code: string;
	public path: string | undefined;
	// Unsupported.
	public syscall: string;
	public stack: string | undefined;

	/**
	 * Represents a BrowserFS error. Passed back to applications after a failed
	 * call to the BrowserFS API.
	 *
	 * Error codes mirror those returned by regular Unix file operations, which is
	 * what Node returns.
	 * @constructor ApiError
	 * @param type The type of the error.
	 * @param [message] A descriptive error message.
	 */
	constructor(type: ErrorCode, message: string, path?: string);

	/**
	 * @return A friendly error message.
	 */
	public toString(): string;

	public toJSON(): any;
}

type FSWatcher = any; /* I'd like to have types for this tbh */

interface FS {
	F_OK: number;
	R_OK: number;
	W_OK: number;
	X_OK: number;
	Stats: Stats;
	_toUnixTimestamp(time: Date | number): number;
	access(path: string, callback: (err: ApiError) => void): void;
	appendFile(filename: string, data: any, cb?: BFSOneArgCallback): void;
	appendFile(
		filename: string,
		data: any,
		options?: object,
		cb?: BFSOneArgCallback
	): void;
	appendFile(
		filename: string,
		data: any,
		encoding?: string,
		cb?: BFSOneArgCallback
	): void;
	chmod(path: string, mode: number | string, cb?: BFSOneArgCallback): void;
	chown(path: string, uid: number, gid: number, cb?: BFSOneArgCallback): void;
	close(fd: number, cb?: BFSOneArgCallback): void;
	createReadStream(path: string, options?: object): null;
	createWriteStream(path: string, options?: object): null;
	exists(path: string, cb?: (exists: boolean) => any): void;
	fchmod(fd: number, mode: string | number, cb: BFSOneArgCallback): void;
	fchown(
		fd: number,
		uid: number,
		gid: number,
		callback?: BFSOneArgCallback
	): void;
	fdatasync(fd: number, cb?: BFSOneArgCallback): void;
	fstat(fd: number, cb?: BFSCallback<Stats>): void;
	fsync(fd: number, cb?: BFSOneArgCallback): void;
	ftruncate(fd: number, cb?: BFSOneArgCallback): void;
	ftruncate(fd: number, len?: number, cb?: BFSOneArgCallback): void;
	futimes(
		fd: number,
		atime: number | Date,
		mtime: number | Date,
		cb?: BFSOneArgCallback
	): void;
	getRootFS(): FileSystem | null;
	initialize(rootFS: FileSystem): FileSystem;
	lchmod(path: string, mode: number | string, cb?: BFSOneArgCallback): void;
	lchown(
		path: string,
		uid: number,
		gid: number,
		cb?: BFSOneArgCallback
	): void;
	link(srcpath: string, dstpath: string, cb?: BFSOneArgCallback): void;

	lstat(path: string, cb?: BFSCallback<Stats>): void;
	mkdir(path: string, mode?: any, cb?: BFSOneArgCallback): void;
	open(
		path: string,
		flag:
			| "r"
			| "r+"
			| "rs"
			| "w"
			| "wx"
			| "w+"
			| "wx+"
			| "a"
			| "ax"
			| "a+"
			| "ax+",
		cb?: BFSCallback<number>
	): void;
	open(
		path: string,
		flag:
			| "r"
			| "r+"
			| "rs"
			| "w"
			| "wx"
			| "w+"
			| "wx+"
			| "a"
			| "ax"
			| "a+"
			| "ax+",
		mode: number | string,
		cb?: BFSCallback<number>
	): void;
	read(
		fd: number,
		length: number,
		position: number | null,
		encoding: string,
		cb?: BFSThreeArgCallback<string, number>
	): void;
	readFile(
		filename: string,
		options: object,
		callback: BFSCallback<string>
	): void;
	readFile(
		filename: string,
		encoding: string,
		cb?: BFSCallback<string>
	): void;
	readFile(filename: string, cb?: BFSCallback<string>): void;
	readdir(path: string, cb?: BFSCallback<string[]>): void;
	readlink(path: string, cb?: BFSCallback<string>): void;
	realpath(path: string, cb?: BFSCallback<string>): void;
	realpath(path: string, cache: object, cb: BFSCallback<string>): void;
	rename(oldPath: string, newPath: string, cb?: BFSOneArgCallback): void;
	rmdir(path: string, cb?: BFSOneArgCallback): void;
	stat(path: string, cb?: BFSCallback<Stats>): void;
	symlink(srcpath: string, dstpath: string, cb?: BFSOneArgCallback): void;
	symlink(
		srcpath: string,
		dstpath: string,
		type?: string,
		cb?: BFSOneArgCallback
	): void;
	truncate(path: string, cb?: BFSOneArgCallback): void;
	truncate(path: string, len: number, cb?: BFSOneArgCallback): void;
	unlink(path: string, cb?: BFSOneArgCallback): void;
	unwatchFile(
		filename: string,
		listener?: (curr: Stats, prev: Stats) => void
	): void;
	utimes(
		path: string,
		atime: number | Date,
		mtime: number | Date,
		cb?: BFSOneArgCallback
	): void;
	watch(
		filename: string,
		listener?: (event: string, filename: string) => any
	): FSWatcher;
	watch(
		filename: string,
		options: object,
		listener?: (event: string, filename: string) => any
	): FSWatcher;
	watchFile(
		filename: string,
		listener: (curr: Stats, prev: Stats) => void
	): void;
	watchFile(
		filename: string,
		options: object,
		listener: (curr: Stats, prev: Stats) => void
	): void;
	wrapCallbacks(cbWrapper: (cb: Function, args: number) => Function): void;
	write(
		fd: number,
		data: any,
		cb?: BFSThreeArgCallback<number, string>
	): void;
	write(
		fd: number,
		data: any,
		position: number | null,
		cb?: BFSThreeArgCallback<number, string>
	): void;
	write(
		fd: number,
		data: any,
		position: number | null,
		encoding: string,
		cb?: BFSThreeArgCallback<number, string>
	): void;
	writeFile(filename: string, data: any, cb?: BFSOneArgCallback): void;
	writeFile(
		filename: string,
		data: any,
		encoding?: string,
		cb?: BFSOneArgCallback
	): void;
	writeFile(
		filename: string,
		data: any,
		options?: object,
		cb?: BFSOneArgCallback
	): void;
}

export enum FileType {
	FILE = 0x8000,
	DIRECTORY = 0x4000,
	SYMLINK = 0xa000
}

interface Stats {
	constructor(
		item: FileType,
		size: number,
		mode?: number,
		atime?: Date,
		mtime?: Date,
		ctim?: Date
	): Stats;

	atime: Date;
	birthtime: Date;
	Dateblksize: number;
	blocks: number;
	ctime: Date;
	dev: number;
	fileData: null;
	gid: number;
	ino: number;
	mode: number;
	mtime: Date;
	nlink: number;
	rdev: number;
	size: number;
	uid: number;

	chmod(mode: number): void;
	clone(): Stats;
	isBlockDevice(): boolean;
	isCharacterDevice(): boolean;
	isDirectory(): boolean;
	isFIFO(): boolean;
	isFile(): boolean;
	isSocket(): boolean;
	isSymbolicLink(): boolean;
}

interface FSModule extends FS {
	FS: FS;
}
