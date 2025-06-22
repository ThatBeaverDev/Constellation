import fs from "../fs.js";

export function blobify(text: string, mime = "text/plain") {
	const blob = new Blob([text], {
		type: mime
	});
	const location = URL.createObjectURL(blob);

	return location;
}

export async function readAndBlobify(directory: string, mime = "text/plain") {
	const text = await fs.readFile(directory);

	const blob = new Blob([text], {
		type: mime
	});
	const location = URL.createObjectURL(blob);

	return location;
}
