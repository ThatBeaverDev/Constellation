export function bytesToSize(bytes: number, decimals = 1) {
	if (isNaN(bytes) || bytes < 0) return "0 B"; // basic sanity

	const units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
	const base = 1024;

	// zero and sub-1 byte cases
	if (bytes < 1) return `${bytes} B`;

	let i = Math.floor(Math.log(bytes) / Math.log(base));
	if (i >= units.length) i = units.length - 1; // clamp

	const value = bytes / Math.pow(base, i);

	return `${value.toFixed(decimals)} ${units[i]}`;
}
