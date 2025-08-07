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
	const text = await fs.readFile(location);
	if (text == undefined)
		throw new Error(`${location} is empty and cannot be 'blobified'`);

	const blob = new Blob([text], {
		type: mime
	});
	const URI = URL.createObjectURL(blob);

	index[URI] = location;

	return URI;
}

export function translateAllBlobURIsToDirectories(text: string): string {
	let str = text;

	if (typeof str !== "string") {
		throw new Error("Translation must from type string");
	}

	for (const i in index) {
		str = str.replaceAll(i, index[i]);
	}

	return str;
}

export async function readAndBlobify(directory: string, mime = "text/plain") {
	const text = await fs.readFile(directory);
	if (text == undefined) throw new Error("File doesn't exist!");

	const blob = new Blob([text], {
		type: mime
	});
	const location = URL.createObjectURL(blob);

	return location;
}

export function dataUriToBlobUrl(dataUri: string): string {
	const [meta, base64] = dataUri.split(",");
	const mime =
		meta.match(/data:(.*?);base64/)?.[1] || "application/octet-stream";
	const binary = atob(base64);
	const array = new Uint8Array(binary.length);

	for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);

	const blob = new Blob([array], { type: mime });
	return URL.createObjectURL(blob);
}
