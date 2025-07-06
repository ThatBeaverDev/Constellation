import { Process } from "./executables.js";

export default function AppWaitingObject(process: Process) {
	return new Promise((resolve) => {
		let interval = setInterval(() => {
			if (process.exit == undefined) {
				clearInterval(interval);
				resolve(process.data);
			}
		}, 5);
	});
}
