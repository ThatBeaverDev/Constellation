export const icons = {};

export function getIcon(name) {
	if (icons[name] == undefined) {
		const icon = document.createElement("img");
		icon.className = "uikitIcon";
		icon.id = window.renderID++;
		icon.dataset.type = name;
		icon.src = "/icons/icons/" + name + ".svg";
		icons[name] = icon;
	}

	return icons[name];
}
