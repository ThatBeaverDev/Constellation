import { Process } from "./executables.js";

export default function AppWaitingObject(process: Process) {
	const obj = {
		hasExited: false,
		// temporary promise
		promise: new Promise((resolve: Function) => resolve())
	};

	obj.promise = new Promise((resolve) => {
		let interval = setInterval(() => {
			if (process.data !== null) {
				clearInterval(interval);

				// mark that the program has exited
				obj.hasExited = true;

				resolve(process.data);
			}
		}, 5);
	});

	return obj;
}
