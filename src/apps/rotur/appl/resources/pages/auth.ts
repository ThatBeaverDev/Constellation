import { Renderer } from "../../../../../lib/uiKit/uiKit";

export default class auth {
	parent: any;
	renderer: Renderer;
	state: "username" | "password" | "loading" = "username";
	credentials: {
		username?: string;
		password?: string;
		constate?: "searching" | "connecting" | "authenticating" | "done";
	} = {};

	constructor(parent: any) {
		this.parent = parent;
		this.renderer = parent.renderer;

		this.renderer.setTextboxContent("");
	}

	render() {
		this.renderer.text(0, 0, "Login with Rotur");

		switch (this.state) {
			case "username": {
				const pass = () => {
					const usr = this.renderer.getTextboxContent();

					if (typeof usr !== "string") return;

					this.state = "password";
					this.renderer.setTextboxContent("");
					this.credentials.username = usr;
				};

				this.renderer.textbox(
					0,
					30,
					this.renderer.windowWidth,
					25,
					"Enter your rotur username here...",
					{
						enter: pass
					}
				);
				this.renderer.button(0, 60, "Submit Username", pass);
				break;
			}

			case "password": {
				const pass = async () => {
					const usr = this.renderer.getTextboxContent();

					if (typeof usr !== "string") return;

					this.state = "loading";
					this.renderer.setTextboxContent("");
					this.credentials.password = usr;

					this.parent.pipes.send.push({
						intent: "login",
						data: {
							username: this.credentials.username,
							password: this.credentials.password
						}
					});

					await new Promise((stop: Function) => {
						let interval = setInterval(() => {
							for (const i in this.parent.pipes.recieve) {
								const msg = this.parent.pipes.recieve[i];

								switch (msg.intent) {
									case "loginResult":
										const ok = msg.data;
										if (ok) {
											clearInterval(interval);
											stop();
											this.parent.exit();
											return;
										}
								}

								this.parent.pipes.recieve.splice(i, 1);
							}
						});
					});
				};

				this.renderer.textbox(
					0,
					30,
					this.renderer.windowWidth,
					25,
					`Enter the rotur password for user '${this.credentials.username}'...`,
					{
						enter: pass
					}
				);
				this.renderer.button(0, 60, "Submit Password", pass);
				break;
			}
			case "loading": {
				switch (this.credentials.constate) {
					case "searching":
						this.renderer.text(
							0,
							30,
							"Searching for Rotur.backgr..."
						);
						break;
					case "connecting":
						this.renderer.text(0, 30, "Connecting to Rotur...");
						break;
					case "authenticating":
						this.renderer.text(0, 30, "Authenticating to Rotur...");
						break;
					case "done":
						break;
					default:
						this.renderer.text(
							0,
							30,
							"Unsure what rotur is doing..."
						);
				}
			}
		}
	}
}
