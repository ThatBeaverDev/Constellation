import ConstellationKernel from "..//kernel.js";
import { UserInterfaceBase } from "../ui/ui.js";
import currentHandler, { Handler } from "./display.js";

const path = "/System/tui/tui.js";

export class TextInterface implements UserInterfaceBase {
	type: "TextInterface" = "TextInterface";
	#ConstellationKernel: ConstellationKernel;
	displayInterface: Handler;

	constructor(ConstellationKernel: ConstellationKernel) {
		this.#ConstellationKernel = ConstellationKernel;
		this.displayInterface = new currentHandler(ConstellationKernel);
	}

	async init() {
		await this.displayInterface.init();
		const post = this.displayInterface.post;

		try {
			post("Please login to Constellation:");

			/* ---------- Login flow ---------- */

			const getUsername = async () => {
				const username =
					await this.displayInterface.getInput("Username: ");

				// get the user
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
				const password =
					await this.displayInterface.getInput("Password: ");

				return password;
			};

			const username = await getUsername();
			const password = await getPassword();

			// check the credentials
			await this.#ConstellationKernel.security.users.validatePassword(
				username,
				password
			);

			/* ---------- Open User Shell ---------- */

			const shell = await this.#ConstellationKernel.runtime.execute(
				"/System/CoreExecutables/Shell.appl",
				[],
				username,
				password
			);
		} catch (e: unknown) {
			if (e instanceof Error) {
				post(String(e.stack));
			} else {
				post(String(e));
			}
			this.#ConstellationKernel.lib.logging.warn(
				path,
				"Shutting down system..."
			);
			this.#ConstellationKernel.terminate();
		}
	}

	setStatus(text: string | Error, state: "working" | "error"): void {
		// TODO: IMPLEMENT
	}

	panic(text: string) {
		// TODO: IMPLEMENT
	}

	terminate() {
		this.displayInterface.terminate();
	}
}
