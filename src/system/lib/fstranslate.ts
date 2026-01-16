import { SystemFilesystemDriver } from "../../fs/fs";
import { FilesystemInterface } from "/System/security/components/env/components/fs.js";

export function userspaceFstoKernelFs(
	fs: FilesystemInterface
): SystemFilesystemDriver {
	// map fs to system interface
	class sysfs /* implements SystemFilesystemDriver */ {
		rootPoint = "/";
		async init() {}
		async writeFile(directory: string, contents: string) {
			return await fs.writeFile(directory, contents);
		}
		async readFile(directory: string): Promise<string> {
			return await fs.readFile(directory);
		}
		async readdir(directory: string) {
			return await fs.listDirectory(directory);
		}
		async rename(oldDirectory: string, newDirectory: string) {
			return await fs.move(oldDirectory, newDirectory);
		}
		async cp(oldDirectory: string, newDirectory: string) {
			return await fs.copy(oldDirectory, newDirectory);
		}
		resolve = fs.resolve;
		relative = fs.relative;

		async stat(directory: string) {
			return await fs.stat(directory);
		}
		async mkdir(directory: string) {
			return await fs.createDirectory(directory);
		}
		async rmdir(directory: string) {
			return await fs.deleteDirectory(directory);
		}
		async unlink(directory: string) {
			return await fs.deleteFile(directory);
		}
		async terminate() {}
	}

	// @ts-expect-error
	return new sysfs();
}
