import * as log from "./logging.js";
import * as config from "../constellation.config.js";
import fs from "../io/fs.js";
import { sha512 } from "./crypto.js";

export const userfile = config.userfile;

export let users = JSON.parse((await fs.readFile(userfile)) || "{}");

function commit() {
	fs.writeFile(userfile, JSON.stringify(users));
}

export class User {
	constructor(username: string, password: string) {
		// this exists solely to build the user, not for prototype functions!
		this.init(username, password);
	}

	username: string | undefined;
	password: string | undefined;
	directory: string | undefined;

	async init(username: string, password: string) {
		log.debug("core:usersys", "User creation for " + username + ".");
		this.username = username;
		this.password = await sha512(password);

		this.directory = "/Users/" + username;
		await fs.mkdir(this.directory);

		for (const sub of config.userDirectories) {
			const location = this.directory + "/" + sub;
			await fs.mkdir(location);
			log.debug("core:usersys", "mkdir at " + location);
		}
	}
}

export const mkusr = async (username: string, password = "") => {
	users[username] = new User(username, password);

	commit();
};

if (users == undefined) {
	log.debug("core:usersys", "initialising user system.");
	users = {
		_adminpass: "admin"
	};
	await mkusr("bvr");
	commit();
}

setInterval(commit, 100);
