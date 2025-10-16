type validElementStyleProperty = Exclude<
	keyof HTMLElement["style"],
	"length" | "parentRule"
>;

export function setElementStyle(
	element: HTMLElement,
	property: validElementStyleProperty,
	value: HTMLElement["style"][validElementStyleProperty]
) {
	// @ts-expect-error
	if (element.style[property] !== value) element.style[property] = value;
}
