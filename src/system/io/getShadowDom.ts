export function constructDOMInterface() {
	const hostElement = document.createElement("div");
	hostElement.className = "graphicalOutput";

	const shadowDOM = hostElement.attachShadow({ mode: "open" });

	// body div
	const container = document.createElement("div");
	container.className = "overlay";
	container.style.zoom = "1";
	shadowDOM.appendChild(container);

	return { shadowDOM, container, host: hostElement };
}
