export async function selectFile(initialDirectory = "/") {
	const sendingPipe = [];
	const recievingPipe = [];

	const app = await env.exec(
		"/System/CoreExecutables/com.constellation.finder",
		["/", "picker", sendingPipe, recievingPipe]
	);

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
