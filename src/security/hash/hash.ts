export async function hash(text: string) {
	const encoder = new TextEncoder();
	const data = encoder.encode(text);

	const hash = await crypto.subtle.digest("SHA-512", data);
	const result = arrayBufferToBase64(hash);

	return "SHA512:" + result;
}

// https://stackoverflow.com/questions/9267899/how-can-i-convert-an-arraybuffer-to-a-base64-encoded-string
function arrayBufferToBase64(buffer: ArrayBuffer) {
	var binary = "";
	var bytes = new Uint8Array(buffer);
	var len = bytes.byteLength;
	for (var i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return globalThis.btoa(binary);
}
