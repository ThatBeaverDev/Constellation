export function setElementStyle<
	elementType extends HTMLElement,
	styleProperties extends keyof CSSStyleDeclaration,
	V extends elementType["style"][styleProperties]
>(element: elementType, property: styleProperties, value: V) {
	if (element.style[property] !== value) {
		element.style[property] = value;
	}
}
