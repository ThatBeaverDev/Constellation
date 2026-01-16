import ConstellationKernel from "../../../kernel.js";

export async function checkProgramClass(
	ConstellationKernel: ConstellationKernel,
	blobURL: string
): Promise<{ result: true } | { result: false; reason: string }> {
	const worker = new Worker(
		await ConstellationKernel.runtime.importsRewriter.resolve(
			"/System/security/components/runtime/worker.js"
		),
		{ type: "module" }
	);

	worker.postMessage({
		program: blobURL,
		processes: await ConstellationKernel.runtime.importsRewriter.resolve(
			"/System/runtime/components/executables.js"
		)
	});

	return new Promise((resolve: Function) => {
		worker.onmessage = (e: MessageEvent<boolean>) => {
			resolve(e.data);
			worker.terminate();
		};

		setTimeout(() => {
			// timeout - worker probably crashed due to the constructor being malicious
			resolve({ result: false, reason: "Worker timeout." });
		}, 2500);
	});
}
