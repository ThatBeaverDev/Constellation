import { PostInstallOptions } from "../../installation.config";

export default class TuiOutOfBoxInstaller extends CommandLineApplication {
	pipe: any[] = [];

	async init(args: any[]) {
		if (args == undefined)
			throw new Error(
				"OOBEInstaller requires a pipe to return the logininfo from."
			);
		this.pipe = args;
	}

	async frame() {
		const post = this.println;
		const wait = (time: number) => {
			return new Promise((resolve: Function) =>
				setTimeout(resolve, time)
			);
		};

		this.clearView();
		post("Welcome to Constellation CLI Setup!");
		await wait(250);

		// user creation
		post("Create your user account");
		post("Enter your details to create your user account");

		const username = await this.getInput("Username: ");
		const technicalName = username
			.trim()
			.replaceAll(" ", "_")
			.toLocaleLowerCase();

		post(`Your home folder's name will be '${technicalName}'.`);

		const password = await this.getInput("Password: ");

		await wait(250);
		post("Setting up Constellation...");
		post("This shouldn't take very long...");

		const result: PostInstallOptions = {
			user: {
				username: technicalName,
				displayName: username,
				password,
				profilePicture: "circle-user-round"
			}
		};

		this.pipe.push(result);

		// we're done!
		this.exit();
	}
}
