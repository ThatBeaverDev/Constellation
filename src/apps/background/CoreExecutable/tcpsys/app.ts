import { IPCMessage } from "../../../../runtime/messages.js";
import ServiceManager from "../components/serviceManager.js";

export default class CoreExecutable extends BackgroundProcess {
	loginCompleted: boolean = false;
	loginDirectory: string =
		"/System/CoreExecutables/systemLoginInterface.appl";
	onLogin = [];
	serviceManager?: ServiceManager;

	async init() {
		const dockDirectory = "/System/CoreExecutables/Dock.appl";
		const loginInterfaceDirectory =
			"/System/CoreExecutables/systemLoginInterface.appl";
		const finderDirectory = "/Applications/Finder.appl";

		this.env.setDirectoryPermission(dockDirectory, "windows", true);
		this.env.setDirectoryPermission(dockDirectory, "keylogger", true);
		this.env.setDirectoryPermission(loginInterfaceDirectory, "users", true);

		this.env.setDirectoryPermission(finderDirectory, "userFiles", true);

		// this.windows
		this.registerKeyboardShortcut("Close Window", "KeyW", ["AltLeft"]);

		// start services
		this.serviceManager = new ServiceManager(this);
		await this.serviceManager.init();

		const params = new URL(window.location.href).searchParams;
		if (params.get("postinstall") == "true") {
			await this.runPostinstaller();
		}

		this.startLoginProcess();
	}

	async runPostinstaller() {
		// TODO: Graphical Postinstall

		//const oobe = await this.env.exec(
		//	"/System/CoreExecutables/OOBEInstaller.appl"
		//);
		//console.log(oobe);
		//const result = await oobe.promise;
		//console.log(result);

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
		const keyboardAPI = "/System/io/keyboard.js";

		if (this.loginCompleted == false) return;

		switch (origin) {
			case keyboardAPI:
				switch (intent) {
					// windows shortcuts
					case "keyboardShortcutTrigger-Close Window": {
						// Close Window!

						const win = this.env.windows.getFocus();
						if (win == undefined) return;

						win.close();
						break;
					}

					default:
						throw new Error(
							"Unknown keyboard shortcut name (intent): " + intent
						);
				}
				break;
			default:
				this.env.warn("Unknown message sender: " + origin);
		}
	}

	frame() {
		if (this.serviceManager) this.serviceManager.frame();
	}
}
