export function isArrow(fn: Function, throwIfNot = false) {
	const isArrow =
		typeof fn === "function" &&
		!fn.prototype &&
		fn.toString().includes("=>");

	if (throwIfNot && !isArrow)
		throw new Error(
			"Arrow functions must be used rather than usual functions."
		);

	return isArrow;
}
