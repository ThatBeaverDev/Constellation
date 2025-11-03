import { executionResult } from "../../../../system/runtime/runtime.js";
import CoreExecutable from "../bin/app.js";

export interface ServiceManifest {
	directory: string;
	restart: "once" | "always";
	graphicalOnly?: boolean;
}

interface Program extends ServiceManifest {
	waitingObject?: executionResult;
	isStarted: boolean;
}

/**
 * CoreExecutable's service manager, which insures that the required programs are running.
 */
export default class ServiceManager {
	serviceDirectory: string = "/System/CoreServices";
	indexLock: boolean = false;
	db: Program[] = [];
	parent: CoreExecutable;
	env: CoreExecutable["env"];

	// indexing
	/**
	 * Last time that we indexed
	 */
	lastIndex: number = 0;
	/**
	 * How often to reindex service files and restart programs
	 */
	indexingInterval: number = 10000;

	constructor(parent: CoreExecutable) {
		this.parent = parent;

		this.env = parent.env;
	}

	async init() {}

	async index() {
		if (this.indexLock == true) return;
		this.indexLock = true;

		// index stuff
		const serviceFiles = await this.env.fs.listDirectory(
			this.serviceDirectory
		);

		const db: typeof this.db = [];

		// consider all services
		for (const file of serviceFiles) {
			// get the data
			const absolutePath = "/System/CoreServices/" + file;

			const exports = (await this.env.include(absolutePath)) as {
				default: ServiceManifest;
			};
			const manifest = exports.default;

			// consider the data
			const currentServiceIndex = this.db
				.map((item) => item.directory)
				.indexOf(manifest.directory);

			/**
			 * Executes the program and places the result into the database.
			 */
			const execute = async (item: Program) => {
				this.env.log("Starting service in " + item.directory, item);
				item.isStarted = true;

				/* ---------- Graphical Check ---------- */
				if (item.graphicalOnly && this.env.systemType == "TUI") {
					// exit since we shouldn't run this

					this.env.log(
						"Service",
						item.directory,
						"will not run since this system is not graphical."
					);

					// don't try again.
					item.waitingObject = {
						promise: new Promise(() => {}),
						hasExited: false
					};
					return;
				}

				// start the program
				const waiting = await this.env.exec(item.directory);

				item.waitingObject = waiting;
			};

			if (currentServiceIndex !== -1) {
				// we already know this one
				const item: Program = this.db[currentServiceIndex];

				if (item.waitingObject == undefined) {
					await execute(item);
					continue;
				}

				if (item.waitingObject.hasExited == true) {
					switch (item.restart) {
						case "once":
							break;
						case "always":
							await execute(item);
							break;
						default:
							throw new Error(
								"Unknown restart policy: " + item.restart
							);
					}
				}

				db.push(item);
			} else {
				const item: Program = { ...manifest, isStarted: true };

				await execute(item);

				db.push(item);
			}
		}

		this.db = db;

		this.indexLock = false;
	}

	frame() {
		const now = Date.now();
		if (now - this.lastIndex > this.indexingInterval) {
			this.index();
			this.lastIndex = now;
		}
	}
}
