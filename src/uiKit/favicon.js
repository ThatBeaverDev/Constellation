const img = new Image();
img.src = "/icons/icons/square-terminal.svg";

img.onload = () => {
	const canvas = document.createElement("canvas");
	canvas.width = img.width;
	canvas.height = img.height;

	const ctx = canvas.getContext("2d");

	// Apply some visual effect
	ctx.filter = "invert(100%) sepia(50%)";
	ctx.drawImage(img, 0, 0);

	const favicon = document.querySelector("link[rel='icon']") || document.createElement("link");
	favicon.rel = "icon";
	favicon.href = canvas.toDataURL("image/svg");

	document.head.appendChild(favicon);
};
