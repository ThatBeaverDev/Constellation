// importer system
// made to inform the user the system is not built yet and needs to be built to prevent an error.

async function check() {
	const src = await fetch("/build/main.js");

	if (src.status !== 200) {
		// system needs to be build
		const div = document.createElement("div");
		div.style.width = "50vw";
		div.style.height = "50vh";

		div.style.position = "absolute";
		div.style.left = "25vw";
		div.style.top = "25vh";

		div.style.borderRadius = "15px";
		div.style.background = "rgba(255, 0, 0, 0.5)";
		div.style.border = "rgba(255, 0, 0, 1) solid 5px";

		const title = document.createElement("h1");
		title.innerText = "Constellation Needs to be built.";
		title.style.width = "90%";
		title.style.height = "50%";

		title.style.position = "absolute";
		title.style.left = "5%";

		title.style.textAlign = "center";

		const body = document.createElement("p");
		body.innerText =
			"Constellation's build script needs to be ran. If you are the owner, you can run `npm run build` to do this, otherwise you can request they do this. Sorry for any inconvenience!";
		body.style.width = "90%";
		body.style.height = "50%";

		body.style.position = "absolute";
		body.style.left = "5%";
		body.style.top = "50%";

		body.style.textAlign = "center";
		body.style.textWrap = "wrap";

		div.innerHTML = title.outerHTML + body.outerHTML;

		document.body.appendChild(div);

		const style = document.createElement("style");
		style.textContent =
			':root {--wallpaper-url: "/wallpapers/Sahara Night Sky.jpg"}';
		document.body.appendChild(style);
	} else {
		const main = document.createElement("script");
		main.type = "module";
		main.src = "/build/main.js";
		main.defer = "true";

		document.body.appendChild(main);
	}
}

check();
