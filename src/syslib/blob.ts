export function blobify(text: string, mime = "text/plain") {
	const blob = new Blob([text], {
		type: mime
	});
	const location = URL.createObjectURL(blob);

	return location;
}
