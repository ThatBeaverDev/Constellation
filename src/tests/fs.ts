import { TestingError } from "./errors.js";

const dirname = ".tests";
const parent = "/";
const dir = "/.tests";
const contentToWrite =
	"Hello, World! This file is from testing and *should* have been deleted. It is safe to delete, however this file's presence indicates the filesystem test has failed, so that may be worth looking into.";

const tests = {
	createDirectoryTest: async () => {
		await env.fs.createDirectory(dir);

		const read = await env.fs.listDirectory(parent);
		if (!read.ok) {
			throw read.data;
		}

		if (read.data.includes(dirname)) {
			// all good
		} else {
			throw new Error("Directory was reported as created but was not.");
		}
	},
	statFolderTest: async () => {
		const stats = await env.fs.stat(dir);

		if (!stats.ok) {
			throw stats.data;
		}

		const isDirectory = await stats.data.isDirectory();

		if (!isDirectory) {
			throw new TestingError("Stat result states that directory is not a directory.");
		}
	},
	createFileTest: async () => {
		await env.fs.createFile(dir + "/file.txt");

		const content = await env.fs.readFile(dir + "/file.txt");
		if (!content.ok) {
			throw content.data;
		}
		if (content.data !== "") {
			throw new TestingError("File after initialisation has content other than blank (''), content is as follows: '" + content.data + "'");
		}
	},
	updateFileTest: async () => {
		await env.fs.updateFile(dir + "/file.txt", contentToWrite);

		const content = await env.fs.readFile(dir + "/file.txt");
		if (!content.ok) {
			throw content.data;
		}
		if (content.data !== contentToWrite) {
			throw new TestingError("Read contents of file do not match what was written - '" + contentToWrite + "' was written, and '" + content.data + "' was read.");
		}
	},
	statFileTest: async () => {
		const stats = await env.fs.stat(dir + "/file.txt");

		if (!stats.ok) {
			throw stats.data;
		}

		const isDirectory = await stats.data.isDirectory();

		if (isDirectory) {
			throw new TestingError("Stat result states that file is a directory.");
		}
	},
	deleteFileTest: async () => {
		const del = await env.fs.deleteFile(dir + "/file.txt");

		if (!del.ok) {
			throw del.data;
		}

		const list = await env.fs.listDirectory(dir);
		if (!list.ok) {
			throw list.data;
		}

		if (list.data.includes("file.txt")) {
			throw new TestingError("File was reported as deleted but was not.");
		}
	},
	createFileOverDirectoryTest: async () => {
		const mkfile = await env.fs.createFile(dir);

		if (mkfile.ok) {
			throw new TestingError("createFile is ok with creating a file in the location of a directory.");
		}
	},
	attemptToModifyNonExistentFile: async () => {
		const write = await env.fs.updateFile(dir + "/new file.txt", contentToWrite);

		if (write.ok) {
			throw new TestingError("updateFile is ok with updating a file which does not exist.");
		}
	},
	deleteEmptyDirectory: async () => {
		const list = await env.fs.listDirectory(dir);

		if (!list.ok) {
			throw list.data;
		}

		if (list.data.length !== 0) {
			throw new TestingError("Files have been left in the " + dir + " directory.");
		}

		const rmdir = await env.fs.deleteDirectory(dir);

		if (!rmdir.ok) {
			throw rmdir.data;
		}

		const list2 = await env.fs.listDirectory(parent);

		if (!list2.ok) {
			throw list2.data;
		}

		if (list2.data.includes(dirname)) {
			throw new TestingError("deleteDirectory has reported ok and done nothing. (in attempt to delete an empty directory)");
		}
	},
	rm_rfFilesystem: async () => {
		const rmrf = await env.fs.deleteDirectory("/");

		if (rmrf.ok) {
			const list = await env.fs.listDirectory("/");
			if (!list.ok) {
				throw new TestingError("deleteDirectory has deleted a directory with contents inside (deleted root)");
			}

			if (list.data.length !== 0) {
				throw new Error("deleteDirectory has reported ok and done nothing. (in attempt to delete root)");
			}
		}
	}
};

export default tests;

export const testNames = Object.keys(tests);
