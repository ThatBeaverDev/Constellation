const style = document.querySelector("body > style:nth-child(5)");

setInterval(async () => {
	const content = await (await fetch("/styles.css")).text();

	if (style.textContent !== content) {
		console.log("style.css hot reloaded!");
		style.textContent = content;
	}
}, 250);
