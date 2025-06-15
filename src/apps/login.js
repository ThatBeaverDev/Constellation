import fs from "/src/fs.js";

export default class Login extends window.Process {
	constructor() {
		super();
		this.users = fs.readFile("/System/users.json");
		console.log(this.users);
	}

	init() {}

	frame() {}
}
