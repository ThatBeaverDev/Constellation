import { appFindResult, fileInfo } from "../../../gui/keystone/lib/appfind.js";
import { requiredAllocations } from "../lib/allocateFileTypeToApplication.js";

export interface filetypeDatabase {
	/**
	 * Filetype-to-directory mapping
	 */
	assignments: Record<string, string[]>;
	apps: fileInfo[];
}

let running: boolean = false;
let extraAssignments: typeof requiredAllocations = [];
export default class filetypeDatabaseManager extends BackgroundProcess {
	databaseDirectory = "/System/ftypedb.json";
	database?: filetypeDatabase;
	lastIndex: number = 0;
	/**
	 * How often to reindex programs
	 */
	indexingInterval: number = 25000;

	indexLock: boolean = false;

	buildAssignments(db: filetypeDatabase) {
		db.assignments = {};
		const assignments = db.assignments;

		function assign(filetype: string, directory: string) {
			if (assignments[filetype] == undefined) {
				assignments[filetype] = [directory];
			} else {
				assignments[filetype].push(directory);
			}
		}

		for (const program of db.apps) {
			for (const filetype of program.filetypes) {
				assign(filetype, program.directory);
			}
		}

		extraAssignments = [...extraAssignments, ...requiredAllocations];

		for (const assignment of extraAssignments) {
			assign(assignment.filetype, assignment.application);
		}

		return db;
	}

	async index() {
		// startup, prevent double indexing
		this.env.debug("indexing...");
		if (this.indexLock == true) return;
		this.indexLock = true;

		// init db
		const db: typeof this.database = { apps: [], assignments: {} };

		// run appfind
		const shellResult = await this.env.shell.exec("appfind");
		if (shellResult == undefined)
			throw new Error(
				"System binary 'appfind' is not present. Application indexing is not available."
			);

		// process appfind
		const appfind = shellResult.result as appFindResult;
		db.apps = appfind.files;

		// build assignments
		let finalDb = this.buildAssignments(db);

		// commit to the main object and write to disk
		this.database = finalDb;
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

		this.env.debug("Initialising filetype database...");

		this.database = { assignments: {}, apps: [] };

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
			this.lastIndex = now;
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
