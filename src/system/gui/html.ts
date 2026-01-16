export function setElementStyle<
	elementType extends HTMLElement,
	styleProperties extends keyof CSSStyleDeclaration,
	V extends elementType["style"][styleProperties]
>(element: elementType, property: styleProperties, value: V) {
	if (element.style[property] !== value) {
		element.style[property] = value;
	}
}

export function setElementProperty<
	elementType extends HTMLElement,
	propertyName extends keyof elementType,
	V extends elementType[propertyName]
>(element: elementType, property: propertyName, value: V) {
	if (element[property] !== value) {
		element[property] = value;
	}
}
