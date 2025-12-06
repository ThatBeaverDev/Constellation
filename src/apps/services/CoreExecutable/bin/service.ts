import ServiceManager from "../components/serviceManager.js";

export default class CoreExecutable extends Service {
	loginCompleted: boolean = false;
	loginDirectory: string =
		"/System/CoreExecutables/systemLoginInterface.appl";
	onLogin = [];
	serviceManager?: ServiceManager;

	async init() {
		const dockDirectory = "/System/CoreExecutables/Dock.appl";
		const loginInterfaceDirectory =
			"/System/CoreExecutables/systemLoginInterface.appl";
		const guiManagerDirectory = "/System/CoreExecutables/guiManager.appl";
		const filetypeDatabaseManagerDirectory =
			"/System/CoreExecutables/filetypeDatabaseManager.srvc";

		// dock permissions
		this.env.setDirectoryPermission(dockDirectory, "windows", true);
		this.env.setDirectoryPermission(dockDirectory, "keylogger", true);

		// loginUI permissions
		this.env.setDirectoryPermission(loginInterfaceDirectory, "users", true);

		// GUI manager permissions
		this.env.setDirectoryPermission(guiManagerDirectory, "operator", true);

		// filetype database manager permissions
		this.env.setDirectoryPermission(
			filetypeDatabaseManagerDirectory,
			"systemFiles",
			true
		);

		// software update installer permissions
		this.env.setDirectoryPermission(
			"/System/CoreExecutables/SoftwareUpdateInstaller.srvc",
			"operator",
			true
		);

		// start services
		this.serviceManager = new ServiceManager(this);
		await this.serviceManager.init();

		this.startLoginProcess();
	}

	/**
	 * Login process, including starting the login UI and handling recieving the target user from it.
	 */
	async startLoginProcess() {
		if (this.env.systemType == "TUI") return;

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

	keydown(
		code: string,
		metaKey: boolean,
		altKey: boolean,
		ctrlKey: boolean,
		shiftKey: boolean,
		repeat: boolean
	): void | Promise<void> {
		if (altKey && code == "KeyW") {
			if (!this.env.windows) return;

			// close window
			const win = this.env.windows.getFocus();
			if (win == undefined) return;

			win.close();
		}
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

	frame() {
		if (this.serviceManager) this.serviceManager.frame();
	}
}
