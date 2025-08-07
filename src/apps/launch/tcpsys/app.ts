import { IPCMessage } from "../../../runtime/messages";

export default class launch extends BackgroundProcess {
	windows?: typeof import("../../../windows/windows");
	loginCompleted: boolean = false;
	loginDirectory: string =
		"/System/CoreExecutables/systemLoginInterface.appl";
	onLogin = [];

	async init() {
		this.env.setDirectoryPermission(
			"/System/CoreExecutables/Dock.appl",
			"windows",
			true
		);
		this.env.setDirectoryPermission(
			"/System/CoreExecutables/Dock.appl",
			"keylogger",
			true
		);
		this.env.setDirectoryPermission(
			"/System/CoreExecutables/systemLoginInterface.appl",
			"users",
			true
		);

		this.windows = await this.env.include("/System/windows.js");

		// this.windows
		this.registerKeyboardShortcut("Close Window", "KeyW", ["AltLeft"]);

		const params = new URL(window.location.href).searchParams;
		if (params.get("postinstall") == "true") {
			await this.runPostinstaller();
		}

		this.startLoginProcess();
	}

	async runPostinstaller() {
		// TODO: Graphical Postinstall

		// remove postinstall indicator
		const params = new URL(window.location.href).searchParams;
		params.delete("postinstall");
		window.history.pushState({}, "", "?" + params.toString());
	}

	/**
	 * Login process, including starting the login UI and handling recieving the target user from it.
	 */
	async startLoginProcess() {
		const login = await this.env.exec(this.loginDirectory, undefined);

		setTimeout(async () => {
			const loginUser = (await login.promise) as
				| undefined
				| {
						username: string;
						password: string;
				  };

			if (loginUser == undefined) {
				throw new Error("Login returned undefined?");
			}

			this.loginComplete(loginUser.username, loginUser.password);
		}, 5);
	}

	/**
	 * Postlogin code executed to start the dock etc.
	 * @param {string} user - Username we're logging into
	 */
	async loginComplete(user: string, password: string) {
		const dock = await this.env.exec(
			"/System/CoreExecutables/Dock.appl",
			[],
			user,
			password
		);

		for (const directory of this.onLogin) {
			await this.env.exec(directory);
		}

		// start the dev app if required.
		const isAppdev =
			new URL(window.location.href).searchParams.get("appdev") !== null;

		if (isAppdev) {
			await this.env.exec("/Applications/developerApplication.appl");
		}

		this.loginCompleted = true;

		// wait to prevent the app freezing.
		await new Promise((resolve: Function) => setTimeout(resolve, 5));
		this.env.log("Login Complete");

		// regardless we should logout, dock crashing makes the OS hard to use.
		await dock.promise;
		this.env.log("Dock exited, opening login panel.");

		// restart the login flow.
		this.startLoginProcess();
	}

	onmessage(msg: IPCMessage) {
		const intent = msg.intent;
		const origin = msg.originDirectory;

		if (this.windows == undefined) return;
		if (this.loginCompleted == false) return;

		switch (origin) {
			case "/System/keyboardShortcuts.js":
				switch (intent) {
					// windows shortcuts
					case "keyboardShortcutTrigger-Close Window": {
						// Close Window!

						const win = this.windows.getWindowOfId(
							this.windows.focusedWindow
						);

						if (win == undefined) return;

						win.remove();
						break;
					}

					default:
						throw new Error(
							"Unknown keyboard shortcut name (intent): " + intent
						);
				}
				break;
			default:
				console.warn("Unknown message sender: " + origin);
		}
	}
}
