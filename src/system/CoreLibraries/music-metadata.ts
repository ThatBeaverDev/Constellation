import { FilesystemInterface } from "../security/components/env/components/fs";
import { parseBlob } from "./metadata/music-metadata";

// Source - https://stackoverflow.com/a
// Posted by Anthony O.
// Retrieved 2025-12-10, License - CC BY-SA 4.0

function _arrayBufferToBase64(buffer: Uint8Array) {
	var binary = "";
	var bytes = new Uint8Array(buffer);
	var len = bytes.byteLength;
	for (var i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return window.btoa(binary);
}

async function resizeImage(url: string, width: number, height: number) {
	return new Promise<string>((resolve) => {
		const sourceImage = new Image();

		sourceImage.onload = function () {
			// Create a canvas with the desired dimensions
			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;

			// Scale and draw the source image to the canvas
			canvas
				.getContext("2d")!
				.drawImage(sourceImage, 0, 0, width, height);

			// Convert the canvas to a data URL in PNG format
			resolve(canvas.toDataURL());
		};

		sourceImage.src = url;
	});
}

export async function metadataForFile(
	fs: FilesystemInterface,
	directory: string
) {
	const datauri = await fs.readFile(directory);

	function dataUriToBlob(dataURI: string) {
		const [header, data] = dataURI.split(",");
		const isBase64 = header.includes("base64");
		const mime = header.split(":")[1].split(";")[0];

		let bytes;

		if (isBase64) {
			const binary = atob(data);
			bytes = new Uint8Array(binary.length);
			for (let i = 0; i < binary.length; i++) {
				bytes[i] = binary.charCodeAt(i);
			}
		} else {
			// URL-encoded data
			bytes = new Uint8Array(
				decodeURIComponent(data)
					.split("")
					.map((c) => c.charCodeAt(0))
			);
		}

		return new Blob([bytes], { type: mime });
	}

	const blob = dataUriToBlob(datauri);

	const parsedFile = await parseBlob(blob);

	return parsedFile;
}

export async function fileCover(
	fs: FilesystemInterface,
	directory: string,
	width: number = 250,
	height: number = 250
) {
	const { common } = await metadataForFile(fs, directory);
	const picture = common.picture[0];

	const b64 = _arrayBufferToBase64(picture.data);

	const dataURI = `data:${picture.format};base64,${b64}`;

	return resizeImage(dataURI, width, height);
}
