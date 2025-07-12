import fs from "/../lib/fs.js";

// I need to state that this is OLD and does NOT work anymore.

export default class Login extends window.Process {
	constructor() {
		super();
		this.users = fs.readFile("/System/users.json");
		console.log(this.users);
	}

	init() {}

	frame() {}
}
