import { Process } from "./executables.js";

export default function AppWaitingObject(process: Process) {
	return new Promise((resolve) => {
		let interval = setInterval(() => {
			if (process.data !== null) {
				clearInterval(interval);
				resolve(process.data);
			}
		}, 5);
	});
}
