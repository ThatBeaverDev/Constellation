import { uiKitInitialisationError } from "./definitions.js";

const style = document.querySelector("body > style:nth-child(5)");

if (style == null) throw new uiKitInitialisationError("styleElement is null.");

setInterval(async () => {
	const content = await (await fetch("/styles.css")).text();

	if (style.textContent !== content) {
		console.log("style.css hot reloaded!");
		style.textContent = content;
	}
}, 250);
