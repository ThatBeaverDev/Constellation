import { FilesystemAPI } from "../fs/fs";

const blobifyCache: Record<string, string> = {};

export default class blobifier {
	index: any = {};

	constructor(public fs: FilesystemAPI) {}

	blobify(
		value: string | Uint8Array<ArrayBuffer>,
		mime = "text/plain"
	): string {
		const keyname = JSON.stringify({ content: value, mimeType: mime });

		// return from cache if we have it
		if (blobifyCache[keyname] !== undefined) {
			return blobifyCache[keyname];
		}

		const blob = new Blob([value], {
			type: mime
		});
		const location = URL.createObjectURL(blob);

		blobifyCache[keyname] = location;

		return location;
	}

	async blobifyDirectory(location: string, mime = "text/plain") {
		const text = await this.fs.readFile(location);
		if (text == undefined)
			throw new Error(`${location} is empty and cannot be 'blobified'`);

		const URI = this.blobify(text, mime);

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

	dataUriToBlobUrl(dataUri: string): string {
		const [meta, base64] = dataUri.split(",");
		const mime =
			meta.match(/data:(.*?);base64/)?.[1] || "application/octet-stream";
		const binary = atob(base64);
		const array = new Uint8Array(binary.length);

		for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);

		return this.blobify(array, mime);
	}
}
