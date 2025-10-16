import ConstellationKernel from "../kernel.js";

export default function restartKernel(
	oldKernel: ConstellationKernel,
	passInstaller: boolean = false
) {
	const rootpoint = String(oldKernel.rootPoint);
	const isGraphical = Boolean(oldKernel.isGraphical);
	const startupConfiguration = oldKernel.startupConfiguration;
	oldKernel.terminate();

	if (!passInstaller) {
		if (startupConfiguration) delete startupConfiguration.installationIdx;
	}

	const kernel = new ConstellationKernel(
		rootpoint,
		isGraphical,
		undefined,
		startupConfiguration
	);

	return kernel;
}
