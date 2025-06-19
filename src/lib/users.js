import config from "../constellation.config.js";
import fs from "../fs.js";
import { sha512 } from "./crypto.js";

export const userfile = config.userfile;

export let users = JSON.parse((await fs.readFile(userfile)) || "{}");

function commit() {
	fs.writeFile(userfile, JSON.stringify(users));
}

if (users == undefined) {
	users = {
		_adminpass: "admin"
	};
	await mkusr("bvr");
	commit();
}

export class User {
	constructor(username, password) {
		// this exists solely to build the user, not for prototype functions!
		this.init(username, password);
	}

	async init(username, password) {
		console.debug("User creation for " + username + ".");
		this.username = username;
		this.password = await sha512(password);

		this.directory = "/Users/" + username;
		await fs.mkdir(this.directory);

		for (const sub of config.userDirectories) {
			const location = this.directory + "/" + sub;
			await fs.mkdir(location);
			console.debug("mkusr: mkdir at " + location);
		}
	}
}

export const mkusr = async (username, password) => {
	users[username] = new User(username, password);

	commit();
};

setInterval(commit, 100);
