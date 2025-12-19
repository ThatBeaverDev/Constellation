import { unzip } from "/System/CoreLibraries/fflate";
import { LatestFileIndex } from "/System/lib/packaging/definitions";

export function dataUriToUIntArray(uri: string) {
	const data = uri.split(",")[1];

	const bytes = atob(data);
	const buffer = new ArrayBuffer(bytes.length);
	const array = new Uint8Array(buffer);

	for (let i = 0; i < bytes.length; i++) {
		array[i] = bytes.charCodeAt(i);
	}

	return array;
}

export default async function zipToIndex(dataURI: string) {
	const zipData = dataUriToUIntArray(dataURI);

	return new Promise((resolve) => {
		const idx: LatestFileIndex = {
			directories: [],
			files: {},
			version: 2
		};

		function insurePathPresence(directory: string) {
			const parts = directory.split("/").filter(Boolean);

			let path = "";
			for (const part of parts) {
				path += "/" + part;

				if (!idx.directories.includes(path)) {
					idx.directories.push(path);
				}
			}
		}

		unzip(zipData, (err, files) => {
			if (err) throw err;

			for (const dir in files) {
				const directory = dir[0] == "/" ? dir : "/" + dir;

				const parent = directory.textBeforeLast("/");
				insurePathPresence(parent);

				const fileContents = new TextDecoder().decode(files[dir]);
				idx.files[directory] = {
					contents: fileContents,

					created: new Date(),
					modified: new Date(),

					size: files[dir].length
				};
			}

			console.debug(idx);
			resolve(idx);
		});
	});
}
