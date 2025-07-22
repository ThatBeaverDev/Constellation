import TerminalAlias from "./terminalAlias.js";
import { Application } from "../apps/executables.js";
import fs from "../io/fs.js";
import { ApplicationAuthorisationAPI } from "../security/env.js";

type shellResult = {
	result: any;
	ref: TerminalAlias;
};

export default class Shell {
	readonly #directory: string;
	readonly #env: ApplicationAuthorisationAPI;
	index: string[] = [];

	#terminalReference?: TerminalAlias;

	constructor(directory: string, env: ApplicationAuthorisationAPI) {
		this.#directory = directory;
		this.#env = env;
		this.setRef();
	}

	indexCommands = async (
		directories: string[] = ["/System/CoreExecutables", "/Applications"]
	) => {
		const allApps: string[] = [];

		for (const dir of directories) {
			const list = await this.#env.fs.listDirectory(dir);
			if (!list.ok) continue;

			if (!(list.data instanceof Array)) continue;

			for (const item of list.data) {
				const rel = await this.#env.fs.resolve(dir, item);

				if (rel.endsWith(".appl") || rel.endsWith(".backgr")) {
					allApps.push(rel);
				}
			}
		}

		const commands: string[] = [];

		for (const app of allApps) {
			const lib = this.#env.fs.resolve(app, "lib");

			const libListing = await this.#env.fs.listDirectory(lib);

			if (!libListing.ok) continue;
			if (libListing.data == undefined) continue;

			for (const sub of libListing.data) {
				commands.push(this.#env.fs.resolve(lib, sub));
			}
		}

		this.index = commands;
	};

	setRef(
		ref: TerminalAlias = {
			path: "/",
			logs: [],
			env: this.#env,
			clearLogs: () => {},
			origin: "/"
		}
	) {
		this.#terminalReference = ref;
	}

	async #getUtility(
		name: string
	): Promise<((parent: TerminalAlias, ...args: any[]) => any) | undefined> {
		for (const item of this.index) {
			const filename = item.textAfterAll("/").textBeforeLast(".");

			if (filename == name) {
				// this is the one
				const include = await this.#env.include(item);

				if (include == undefined) return;

				const fnc = include.default;

				if (typeof fnc !== "function") return;

				return fnc;
			}
		}
	}

	async exec(name: string, ...args: any[]): Promise<shellResult | undefined> {
		if (this.#terminalReference == undefined)
			throw new Error("Terminal reference must be defined!");

		const util = await this.#getUtility(name);

		if (util == undefined) return undefined;

		const result = await util(this.#terminalReference, ...args);

		return {
			ref: this.#terminalReference,
			result: result
		};
	}
}
