export async function downloadAndConvert(URL) {
	const response = await fetch(URL);
	if (!response.ok) {
		throw new Error("Failed to download the file.");
	}
	const blob = await response.blob();
	const dataURL = await this.blobToDataURL(blob);
	return dataURL;
}
