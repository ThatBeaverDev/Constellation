import { IPCMessage } from "../../../messages";

const conf = await env.include("/System/constellation.config.js");

type roturConfiguration = {
	username: string;
	password: string;
};

export default class roturIntegration extends BackgroundProcess {
	name: string = "roturIntegration.backgr";
	rotur: any;
	libDirectory: string = "/System/CoreLibraries/rotur.js";
	config?: roturConfiguration;
	liveStatusText: string = "";
	ok: boolean = false;

	async fsInit() {
		await env.fs.createDirectory("/Temporary/roturIntegration");

		const roturConfig = (
			await env.include(
				env.fs.relative(this.directory, "data/rotur.config.js")
			)
		).default;

		if (roturConfig.username == undefined) {
			// login

			const sendingPipe: any[] = [];
			const recievingPipe: any[] = [];

			env.debug(this.name, "Starting rotur.appl GUI login prompt");
			env.exec("/Applications/Rotur.appl", [
				"iNeedYouToLoginPlease",
				sendingPipe,
				recievingPipe
			]);

			await new Promise((stop: Function) => {
				let interval = setInterval(async () => {
					for (const i in recievingPipe) {
						const handleMsg = async (msg: any) => {
							switch (msg.intent) {
								case "login":
									let loginStat;
									let ok;

									await new Promise((resolve: Function) => {
										let interval = setInterval(() => {
											if (this.rotur.connected) {
												clearInterval(interval);
												resolve();
											}
										});
									});

									try {
										loginStat = await this.auth(
											msg.data.username,
											msg.data.password
										);
									} catch {
										ok = false;
									}

									if (loginStat == undefined) {
										ok = false;
									} else if (
										loginStat.startsWith("Logged in as")
									) {
										ok = true;
									}

									sendingPipe.push({
										intent: "loginResult",
										data: ok
									});

									clearInterval(interval);
									stop();
									break;
							}
						};
						handleMsg(structuredClone(recievingPipe[i]));
						recievingPipe.splice(Number(i), 1);
					}
				}, 10);
			});
		}
	}

	async validConnection() {
		await new Promise((resolve: Function) => {
			let interval = setInterval(() => {
				if (this.rotur.userToken !== "") {
					clearInterval(interval);
					resolve();
				}
			});
		});
	}

	async init() {
		const read = await env.fs.readFile("/Temporary/roturBackendRunning");
		if (!read.ok) throw read.data;
		if (read.data == "true") {
			env.error(this.name, "Rotur backend is already running. exiting.");
			this.exit();
			return;
		}

		this.shout("com.rotur.roturItegrationBackgr");

		const fsInitResult = this.fsInit()

		env.debug(this.name, "initialising rotur...");

		await env.fs.writeFile("/Temporary/roturBackendRunning", "true");

		const rotur = await env.include(
			env.fs.relative(this.directory, "./resources/roturV6.js")
		);
		const construct = rotur.default;

		this.rotur = new construct();
		const r = this.rotur;

		r.eventTriggers.whenConnected = async () => {
			await env.fs.writeFile(
				"/Temporary/roturIntegration/processIdentifier",
				String(this.id)
			);
		};
		r.eventTriggers.whenAuthenticated = () => {
			this.connected();
		};

		await r.connectToServer("crl", conf.name, conf.version);

		await fsInitResult

		this.ok = true;
	}

	async auth(username: string, password: string) {
		const status = await this.rotur.login(username, password);

		env.log(this.name, status);

		return status;
	}

	connected() {}

	get status() {
		if (this.rotur.connected) {
			if (this.rotur.loggedIn) {
				return "Connected and Authenticated";
			} else {
				return "Connected and Unauthenticated...";
			}
		} else {
			return "Not Connected";
		}
	}

	generateStatus() {
		const obj = {
			status: this.status,
			connected: this.rotur.connected,
			authenticated: this.rotur.loggedIn,

			connectionID: this.rotur.username,

			username: this.rotur.user?.username,
			userobj: this.rotur.user
		};

		return JSON.stringify(obj);
	}

	frame() {
		if (!this.ok) return;

		const newStatus = this.generateStatus();
		if (this.liveStatusText !== newStatus) {
			this.liveStatusText = String(newStatus);
			env.fs.writeFile(
				"/Temporary/roturIntegration/status.json",
				newStatus
			);
		}
	}

	async onmessage(msg: IPCMessage) {
		switch (msg.intent) {
			case "getRoturToken":

			await this.validConnection()

			msg.reply(this.rotur.userToken);
			break;
		}
	}
}
