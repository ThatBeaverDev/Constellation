import { SystemFilesystemDriver } from "../../fs/fs.js";
import { Terminatable } from "../kernel.js";

export default class blobifier implements Terminatable {
	index: Record<string, string> = {};
	//cache: Record<string, { blobURI: string; mime: string; modified: Date }> =
	//	{};

	constructor(public fs: SystemFilesystemDriver) {}

	blobify(
		value: string | Uint8Array<ArrayBuffer>,
		mime = "text/plain"
		//date: Date
	): string {
		//const keyname = JSON.stringify({ content: value, mimeType: mime });
		//
		// return from cache if we have it
		//const cacheValue = this.cache[keyname];
		//if (cacheValue !== undefined) {
		//	const dateTime = date.getTime();
		//	const cacheTime = cacheValue.modified.getTime();
		//
		//	if (cacheTime < dateTime) {
		//		// our date is more recent - the cache is outdated
		//		this.revokeURL(cacheValue.blobURI);
		//		// continue and generate a new one
		//	} else {
		//		return cacheValue.blobURI;
		//	}
		//}

		const blob = new Blob([value], {
			type: mime
		});
		const location = URL.createObjectURL(blob);

		//this.cache[keyname] = {
		//	blobURI: location,
		//	mime,
		//	modified: date ?? new Date()
		//};

		setTimeout(() => {
			this.revokeURL(location);
		}, 500);

		return location;
	}

	async blobifyDirectory(directory: string, mime = "text/plain") {
		const text = await this.fs.readFile(directory);
		//const stats = await this.fs.stat(directory);

		if (text == undefined /*|| stats == undefined*/)
			throw new Error(`${directory} is empty and cannot be 'blobified'`);

		const URI = this.blobify(text, mime /*, stats.mtime*/);

		this.index[URI] = directory;

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

		//const unixTimeZero = new Date("1970-01-01T00:00:00Z");

		return this.blobify(array, mime /*, unixTimeZero*/);
	}

	revokeURL(uri: string, mime = "text/plain") {
		URL.revokeObjectURL(uri);

		//const values = Object.values(this.cache);
		//const index = values.map((item) => item.blobURI).indexOf(uri);
		//const keyname = Object.keys(this.cache)[index];
		//
		//if (this.cache[keyname] !== undefined) {
		//	delete this.cache[keyname];
		//}
	}

	terminate(): Promise<void> | void {
		//for (const key in this.cache) {
		//	const value = this.cache[key];
		//
		//	this.revokeURL(value.blobURI, value.mime);
		//}
	}
}
