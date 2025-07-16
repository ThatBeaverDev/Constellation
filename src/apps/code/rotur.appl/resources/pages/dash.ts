import { Renderer } from "../../../../../lib/uiKit/uiKit";
import roturGui from "../../tcpsys/app";
const roturLib = await env.include("/System/CoreLibraries/rotur.js")

export default class dash {
	parent: roturGui;
	renderer: Renderer;
	status: any;
	tick: number = 0;
	backgroundPID: number | undefined;

	constructor(parent: roturGui) {
		this.parent = parent;
		this.renderer = parent.renderer;
	}

	getBackgroundProcessID() {
		const pid = env.getPIDOfName("com.rotur.roturItegrationBackgr");

		return pid;
	}

	async refreshStatus() {
		this.status = await this.parent.getStatus();
	}

	async refresh() {
		this.backgroundPID = this.getBackgroundProcessID();

		await this.refreshStatus();
		this.status.token = await roturLib.getToken(this.parent.sendmessage);
	}

	render() {
		if (this.tick % 25 == 0) {
			this.refresh();
		}
		this.tick++;

		if (this.status == undefined) {
			this.renderer.text(0, 0, "Loading...")
			return;
		}

		this.renderer.text(0, 0, "Connection Status:");
		this.renderer.text(0, 25, this.status.status);
		this.renderer.icon(250, 0, "https://avatars.rotur.dev/" + this.status.username, 1.875)

		this.renderer.text(0, 70, "User Info:");
		this.renderer.text(0, 95, "Username: " + this.status.username);
		this.renderer.text(0, 120, "Token: " + this.status.token);
	}
}
