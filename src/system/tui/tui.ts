import ConstellationKernel from "..//kernel.js";
import { UserInterfaceBase } from "../ui/ui.js";
import currentHandler, { Handler } from "./display.js";

const path = "/System/tui/tui.js";

export class TextInterface implements UserInterfaceBase {
	type: "TextInterface" = "TextInterface";
	#ConstellationKernel: ConstellationKernel;
	displayInterface: Handler;

	constructor(ConstellationKernel: ConstellationKernel, handler?: Handler) {
		this.#ConstellationKernel = ConstellationKernel;

		if (handler) {
			this.displayInterface = handler;
		} else {
			this.displayInterface = new currentHandler(ConstellationKernel);
		}
	}

	async init() {
		await this.displayInterface.init();
	}

	async postinstall() {
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

			const shellPrintLn = (data: string) => {
				post(data);
			};
			const shellGetInput = async (query: string) => {
				return this.displayInterface.getInput(query);
			};
			const shellClearView = () => {
				this.displayInterface.clearView();
			};

			await this.#ConstellationKernel.runtime.execute(
				"/System/CoreExecutables/Shell.appl",
				[],
				username,
				password,
				undefined,
				false,
				undefined,
				{
					print: shellPrintLn,
					getInput: shellGetInput,
					clearView: shellClearView
				},
				true
			);
		} catch (e: unknown) {
			if (e instanceof Error) {
				post(String(e.stack));
			} else {
				post(String(e));
			}
			this.#ConstellationKernel.lib.logging.warn(
				path,
				"This system should be shut down."
			);
		}
	}

	setStatus(text: string | Error, state: "working" | "error"): void {
		this.displayInterface.post(String(text));
	}

	panic(text: string) {
		this.displayInterface.clearView();
		this.displayInterface.post(text);
	}

	terminate() {
		this.displayInterface.terminate();
	}
}
