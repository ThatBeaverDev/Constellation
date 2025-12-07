import TerminalAlias from "../../../../system/lib/terminalAlias";

export default async function rm(
	parent: TerminalAlias,
	...directories: string[]
) {
	for (const dir of directories) {
		const directory = parent.env.fs.resolve(parent.path, dir);

		const stats = await parent.env.fs.stat(directory);

		if (stats.isDirectory()) {
			const walk = async (directory: string) => {
				const items = await parent.env.fs.listDirectory(directory);

				for (const item of items) {
					const path = parent.env.fs.resolve(directory, item);

					const stats = await parent.env.fs.stat(path);

					if (stats.isDirectory()) {
						await walk(path);
					} else {
						await parent.env.fs.deleteFile(path);
					}
				}

				await parent.env.fs.deleteDirectory(directory);
			};

			await walk(directory);
		} else {
			await parent.env.fs.deleteFile(directory);
		}
	}
}
