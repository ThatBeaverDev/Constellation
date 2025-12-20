import { appFindResult, fileInfo } from "../lib/appfind.js";
import { IPCMessage } from "/System/runtime/components/messages.js";

export interface filetypeDatabase {
	/** All apps that support each filetype */
	handlers: Record<string, string[]>;

	/** User-chosen defaults */
	defaults: Record<string, string>;

	/** App metadata */
	apps: fileInfo[];
}

let running: boolean = false;
export default class filetypeDatabaseManager extends Service {
	databaseDirectory = "/System/ftypedb.json";
	database: filetypeDatabase = { apps: [], defaults: {}, handlers: {} };
	lastIndex: number = 0;
	/**
	 * How often to reindex programs
	 */
	indexingInterval: number = 25000;

	indexLock: boolean = false;

	defaultRequests: {
		filetype: string;
		newApplication: string;
		requestee: string;
	}[] = [];
	acceptedDefaultRequests: {
		filetype: string;
		newApplication: string;
		requestee: string;
	}[] = [];
	isRequesting: boolean = false;

	buildHandlers(db: filetypeDatabase) {
		db.handlers = {};

		function add(filetype: string, app: string) {
			if (!db.handlers[filetype]) {
				db.handlers[filetype] = [];
			}
			if (!db.handlers[filetype].includes(app)) {
				db.handlers[filetype].push(app);
			}
		}
		const setDefault = (
			filetype: string,
			app: string,
			force: boolean = false
		) => {
			if (!db.defaults[filetype] || force == true) {
				db.defaults[filetype] = app;
				return true;
			} else {
				return false;
			}
		};

		for (const program of db.apps) {
			for (const filetype of program.filetypes) {
				add(filetype, program.directory);
			}
		}

		for (const request of this.defaultRequests) {
			const passed = setDefault(request.filetype, request.newApplication);

			const askUser = async () => {
				// wait if we're already asking the user
				if (this.isRequesting) {
					await new Promise<void>((resolve) => {
						setInterval(() => {
							if (!this.isRequesting) {
								resolve();
							}
						}, 250);
					});
				}
				this.isRequesting = true;

				const exec = await this.env.exec(
					this.env.fs.resolve("./components/req.appl"),
					[
						request.requestee,
						request.filetype,
						this.database.defaults[request.filetype],
						request.newApplication
					]
				);
				const result: boolean = await exec.promise;

				if (result) {
					this.acceptedDefaultRequests.push(request);
				}

				this.isRequesting = false;
			};

			if (!passed) {
				askUser();
			}
		}
		this.defaultRequests = [];

		for (const accepted of this.acceptedDefaultRequests) {
			setDefault(accepted.filetype, accepted.newApplication, true);
		}
		this.acceptedDefaultRequests = [];

		return db;
	}

	async index() {
		// startup, prevent double indexing
		if (this.indexLock == true) return;
		this.indexLock = true;

		this.env.debug("indexing...");
		this.lastIndex = Date.now();

		// run appfind
		const shellResult = await this.env.shell.exec("appfind");
		if (shellResult == undefined)
			throw new Error(
				"System binary 'appfind' is not present. Application indexing is not available."
			);

		// process appfind
		const appfind = shellResult.result as appFindResult;
		this.database.apps = appfind.files;

		this.buildHandlers(this.database);

		await this.env.fs.writeFile(
			this.databaseDirectory,
			JSON.stringify(this.database)
		);

		this.indexLock = false;
	}

	async init() {
		if (running) {
			this.exit();
			return;
		}
		running = true;

		// startup shell
		await this.env.shell.index();
		this.shout("ftypedbmgr");

		this.env.debug("Initialising filetype database...");

		try {
			this.database = JSON.parse(
				await this.env.fs.readFile(this.databaseDirectory)
			);
		} catch (e) {
			// just a JSON parse error because it's empty. make a new one.
		}

		this.env.debug("Storing initial filetype database...", this.database);

		await this.env.fs.writeFile(
			this.databaseDirectory,
			JSON.stringify(this.database)
		);
	}

	frame() {
		const now = Date.now();
		if (now - this.lastIndex > this.indexingInterval) {
			this.index();
		}
	}

	onmessage(msg: IPCMessage): void {
		switch (msg.intent) {
			case "setDefault":
				const filetype = msg.data[0];
				const application = msg.data[1];
				if (typeof filetype !== "string") return;
				if (typeof application !== "string") return;

				if (filetype[0] !== ".") {
					this.env.warn(
						msg,
						"Requested filetype must be '.filetype' rather than 'filetype'"
					);
					return;
				}

				this.defaultRequests.push({
					filetype,
					newApplication: application,
					requestee: msg.originDirectory
				});

				// index so we're up to date
				this.index();

				break;
		}
	}

	exit(value?: Exclude<any, null>): void {
		running = false;
		this.env.warn(
			"filetypeDatabase cannot have more than one running manager."
		);
		super.exit(value);
	}
}
