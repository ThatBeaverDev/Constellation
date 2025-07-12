import fs from "../io/fs.js";

export const index: any = {};

export function blobify(text: string, mime = "text/plain") {
	const blob = new Blob([text], {
		type: mime
	});
	const location = URL.createObjectURL(blob);

	return location;
}

export async function blobifyDirectory(location: string, mime = "text/plain") {
	const read = await env.fs.readFile(location);
	if (!read.ok) throw read.data;

	const text = read.data;

	const blob = new Blob([text], {
		type: mime
	});
	const URI = URL.createObjectURL(blob);

	index[URI] = location;

	return URI;
}

export function translateAllBlobURIsToDirectories(text: string): string {
	let str = text;

	for (const i in index) {
		str = str.replaceAll(i, index[i]);
	}

	return str;
}

export async function readAndBlobify(directory: string, mime = "text/plain") {
	const text = await fs.readFile(directory);

	const blob = new Blob([text], {
		type: mime
	});
	const location = URL.createObjectURL(blob);

	return location;
}
