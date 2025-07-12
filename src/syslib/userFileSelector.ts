export async function selectFile(initialDirectory = "/") {
	const sendingPipe: any[] = [];
	const recievingPipe: any[] = [];

	await env.exec("/System/CoreExecutables/com.constellation.finder", [
		initialDirectory,
		"picker",
		sendingPipe,
		recievingPipe
	]);

	sendingPipe.push("hk");

	return new Promise((resolve) => {
		const interval = setInterval(() => {
			// loop through messages

			for (const msg of recievingPipe) {
				switch (msg.intent) {
					case "selectionComplete":
						clearInterval(interval);
						resolve(msg.data);
						return;
				}
			}
		});
	});
}
