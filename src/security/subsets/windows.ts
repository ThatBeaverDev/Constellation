import WindowSystem from "../../gui/display/windowSystem.js";
import { GraphicalWindow } from "../../gui/display/windowTypes.js";
import ConstellationKernel from "../../kernel.js";
import { securityTimestamp, WindowAlias } from "../definitions.js";
import { ApplicationAuthorisationAPI } from "../env.js";
import { Permission } from "../permissions.js";

export default class EnvWindows {
	#ConstellationKernel: ConstellationKernel;
	#WindowSystem: WindowSystem;
	#env: ApplicationAuthorisationAPI;
	#checkPermission: (permission: Permission) => void;

	constructor(
		ConstellationKernel: ConstellationKernel,
		parent: ApplicationAuthorisationAPI,
		permissionCheck: (permission: Permission) => void
	) {
		this.#ConstellationKernel = ConstellationKernel;
		this.#env = parent;
		this.#checkPermission = permissionCheck;

		if (!ConstellationKernel.GraphicalInterface)
			throw new Error("This requires a graphical kernel.");

		this.#WindowSystem =
			ConstellationKernel.GraphicalInterface.windowSystem;
	}

	get lowerBound() {
		this.#checkPermission("windows");

		return Number(this.#WindowSystem.bounds.lower);
	}
	get upperBound() {
		this.#checkPermission("windows");

		return Number(this.#WindowSystem.bounds.upper);
	}
	get leftBound() {
		this.#checkPermission("windows");

		return Number(this.#WindowSystem.bounds.left);
	}
	get rightBound() {
		this.#checkPermission("windows");

		return Number(this.#WindowSystem.bounds.right);
	}
	set lowerBound(value: number) {
		this.#checkPermission("windows");

		this.#WindowSystem.bounds.lower = Number(value);
	}
	set upperBound(value: number) {
		this.#checkPermission("windows");

		this.#WindowSystem.bounds.upper = Number(value);
	}
	set leftBound(value: number) {
		this.#checkPermission("windows");

		this.#WindowSystem.bounds.left = Number(value);
	}
	set rightBound(value: number) {
		this.#checkPermission("windows");

		this.#WindowSystem.bounds.right = Number(value);
	}

	/**
	 *
	 * @param {GraphicalWindow} win - Window to create alias of
	 * @returns WindowAlias for the provided window
	 */
	#windowToAlias = (win: GraphicalWindow): WindowAlias => {
		const obj: WindowAlias = {
			move: win.move.bind(win),
			resize: win.resize.bind(win),
			close: win.remove.bind(win),

			minimise: win.minimise.bind(win),
			unminimise: win.unminimise.bind(win),
			minimised: win.minimised,

			fullscreen: win.fullscreen.bind(win),
			unfullscreen: win.unfullscreen.bind(win),
			fullscreened: win.fullscreened,

			show: win.show.bind(win),
			hide: win.hide.bind(win),

			showHeader: win.showHeader.bind(win),
			hideHeader: win.hideHeader.bind(win),

			name: win.name,
			shortName: win.shortname,
			iconName: win.iconName,
			applicationDirectory: win.Application?.directory,

			position: win.position,
			dimensions: win.dimensions,

			winID: win.winID
		};

		return obj;
	};

	/**
	 * @returns an array for every window's WindowAlias
	 */
	all(): WindowAlias[] {
		const start = performance.now();

		this.#checkPermission("windows");
		const UserInterface = this.#ConstellationKernel.GraphicalInterface;
		if (UserInterface == undefined) return [];

		const obj: WindowAlias[] = [];

		for (const win of UserInterface.windowSystem.allWindows()) {
			const wn = this.#windowToAlias(win);

			obj.push(wn);
		}

		securityTimestamp(`Env ${this.#env.directory} get all windows`, start);

		return obj;
	}

	/**
	 * @returns WindowAlias of the focused window
	 */
	getFocus(): WindowAlias | undefined {
		const start = performance.now();

		this.#checkPermission("windows");
		const UserInterface = this.#ConstellationKernel.GraphicalInterface;
		if (UserInterface == undefined) return undefined;

		const target = UserInterface.windowSystem.getWindowOfId(
			UserInterface.windowSystem.focusedWindow
		);

		if (target == undefined) return undefined; // no window is focused

		const obj = this.#windowToAlias(target);

		securityTimestamp(`Env ${this.#env.directory} get window focus`, start);

		return obj;
	}

	/**
	 * Focuses the window by the given ID.
	 * @param id - the Window's ID.
	 */
	focusWindow(id: number) {
		this.#checkPermission("windows");
		const UserInterface = this.#ConstellationKernel.GraphicalInterface;
		if (UserInterface == undefined) return undefined;

		UserInterface.windowSystem.focusWindow(id);
	}
}
