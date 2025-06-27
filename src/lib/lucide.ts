export const icons = {};

const div = document.createElement("div");
div.id = "lucideIconCache";

document.getElementsByClassName("hidden")[0].appendChild(div);

const cache: any = {};

function initIcon(name: string) {
	const icon = document.createElement("img");
	icon.dataset.type = name;
	icon.className = "uikitIcon";
	icon.src = "/icons/icons/" + name + ".svg";
	icon.id = String(window.renderID++);

	div.appendChild(icon);

	cache[name] = document.getElementById(icon.id)!;
}

export function getIcon(name: string): HTMLElement {
	if (cache[name] == undefined) {
		initIcon(name);
	}

	// @ts-ignore
	const linked: HTMLElement = cache[name];

	// @ts-ignore
	const icon: HTMLElement = linked.cloneNode(true);

	icon.id = String(window.renderID++);
	// @ts-expect-error
	icon.alt = name;

	return icon;
}
