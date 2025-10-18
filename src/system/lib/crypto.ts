import panic from "./panic.js";

// https://stackoverflow.com/questions/9267899/how-can-i-convert-an-arraybuffer-to-a-base64-encoded-string
function _arrayBufferToBase64(buffer: ArrayBuffer) {
	let binary = "";
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return binary;
}

if (window.crypto.subtle == undefined) {
	panic(
		new Error(
			"crypto.subtle is not present - Constellation's cryptographical security systems cannot start."
		)
	);
}

export async function sha512(text: string) {
	const Uint16 = Uint16Array.from(
		text.split("").map((letter) => letter.charCodeAt(0))
	);
	const hash = await window.crypto.subtle.digest("sha-512", Uint16);

	return _arrayBufferToBase64(hash);
}
