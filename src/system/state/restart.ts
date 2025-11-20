import ConstellationKernel from "../kernel.js";

export default function restartKernel(
	oldKernel: ConstellationKernel,
	passInstaller: boolean = false
) {
	const KernelConstructor = Object.getPrototypeOf(oldKernel)
		.constructor as typeof ConstellationKernel;

	const rootpoint = String(oldKernel.rootPoint);
	const fsApi = oldKernel.fs;
	const isGraphical = Boolean(oldKernel.isGraphical);
	const startupConfiguration = oldKernel.startupConfiguration;
	oldKernel.terminate();

	if (!passInstaller) {
		if (startupConfiguration) delete startupConfiguration.installationIdx;
	}

	const kernel = new KernelConstructor(
		rootpoint,
		isGraphical,
		undefined,
		fsApi,
		startupConfiguration
	);

	return kernel;
}
