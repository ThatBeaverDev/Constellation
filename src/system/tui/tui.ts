import ConstellationKernel from "..//kernel.js";

const path = "/System/tui/tui.js";

export class TextInterface {
	#ConstellationKernel: ConstellationKernel;
	readline?: typeof import("readline");

	constructor(ConstellationKernel: ConstellationKernel) {
		this.#ConstellationKernel = ConstellationKernel;
		this.#ConstellationKernel;
	}

	async init() {
		this.readline = await import("readline");
		const post = this.#ConstellationKernel.lib.logging.post;
		post("Please login to Constellation:");

		const getUsername = async () => {
			const username = await this.ask("Username: ");

			const selectedUser =
				this.#ConstellationKernel.security.users.getUser(username);
			if (selectedUser == undefined) {
				post(
					`Couldn't find user by name '${username}'. Please try again.`
				);

				return await getUsername();
			} else {
				return username;
			}
		};

		const getPassword = async () => {
			const password = await this.ask("Password: ");

			return password;
		};

		const username = await getUsername();
		const password = await getPassword();

		const isAuthenticated =
			await this.#ConstellationKernel.security.users.validatePassword(
				username,
				password
			);

		this.#ConstellationKernel.lib.logging.warn(path, isAuthenticated);

		const cache = new Set();

		console.log(
			JSON.stringify(
				this.#ConstellationKernel,
				(key, value) => {
					if (typeof value === "object" && value !== null) {
						// If the object has already been seen, return undefined
						// to avoid circular reference
						if (cache.has(value)) {
							return; // Remove circular reference
						}
						// Store the object in the cache
						cache.add(value);
					}
					return value;
				},
				4
			)
		);

		cache.clear(); // Clear the cache after serialization
	}

	async ask(question: string): Promise<string> {
		return new Promise((resolve: (result: string) => void) => {
			if (this.readline == undefined) {
				resolve("");
				return;
			}

			const rl = this.readline.createInterface({
				input: process.stdin,
				output: process.stdout
			});

			rl.question(question, (response: string) => {
				resolve(response);
				rl.close();
			});
		});
	}
}
