import { FilesystemAPI } from "../fs/fs";

export default class blobifier {
	index: any = {};

	constructor(public fs: FilesystemAPI) {}

	blobify(text: string, mime = "text/plain") {
		const blob = new Blob([text], {
			type: mime
		});
		const location = URL.createObjectURL(blob);

		return location;
	}

	async blobifyDirectory(location: string, mime = "text/plain") {
		const text = await this.fs.readFile(location);
		if (text == undefined)
			throw new Error(`${location} is empty and cannot be 'blobified'`);

		const blob = new Blob([text], {
			type: mime
		});
		const URI = URL.createObjectURL(blob);

		this.index[URI] = location;

		return URI;
	}

	translateAllBlobURIsToDirectories(text: string): string {
		let str = text;

		if (typeof str !== "string") {
			throw new Error("Translation must from type string");
		}

		for (const i in this.index) {
			str = str.replaceAll(i, this.index[i]);
		}

		return str;
	}

	async readAndBlobify(directory: string, mime = "text/plain") {
		const text = await this.fs.readFile(directory);
		if (text == undefined) throw new Error("File doesn't exist!");

		const blob = new Blob([text], {
			type: mime
		});
		const location = URL.createObjectURL(blob);

		return location;
	}

	dataUriToBlobUrl(dataUri: string): string {
		const [meta, base64] = dataUri.split(",");
		const mime =
			meta.match(/data:(.*?);base64/)?.[1] || "application/octet-stream";
		const binary = atob(base64);
		const array = new Uint8Array(binary.length);

		for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);

		const blob = new Blob([array], { type: mime });
		return URL.createObjectURL(blob);
	}
}
