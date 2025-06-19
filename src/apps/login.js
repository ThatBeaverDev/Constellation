import fs from "/../lib/fs.js";

export default class Login extends window.Process {
	constructor() {
		super();
		this.users = fs.readFile("/System/users.json");
		console.log(this.users);
	}

	init() {}

	frame() {}
}
