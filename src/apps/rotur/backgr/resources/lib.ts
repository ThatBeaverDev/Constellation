import { Process } from "../../../executables";

export async function insureConnection() {
	const read = await env.fs.readFile("/Temporary/roturBackendRunning");
	if (!read.ok) throw read.data;

	if (read.data !== "true") {
		env.exec("/Applications/Rotur.backgr");
	}
}

let roturPID: any = env.getPIDOfName("com.rotur.roturItegrationBackgr");
const refetchPID = () => {
	roturPID = env.getPIDOfName("com.rotur.roturItegrationBackgr");
};
setInterval(refetchPID, 1000);

export async function getToken(sendmessage: Process["sendmessage"]) {
	if (typeof sendmessage !== "function") {
		throw new Error("sendmessage function must be provided");
	}

	if (roturPID == undefined) {
		refetchPID();
		if (roturPID == undefined) {
			throw new Error(
				"PID of com.rotur.roturItegrationBackgr is not known."
			);
		}
	}

	let token: null | string = null;

	sendmessage(roturPID, "getRoturToken", {}, (data: any) => {
		token = data;
	});

	return await new Promise((resolve: Function) => {
		let interval = setInterval(() => {
			if (token !== null) {
				clearInterval(interval);
				resolve(token);
			}
		});
	});
}
