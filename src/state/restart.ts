import ConstellationKernel from "../system/kernel.js";

export default function restartKernel(
	oldKernel: ConstellationKernel,
	passInstaller: boolean = false
) {
	const rootpoint = String(oldKernel.rootPoint);
	const fsApi = oldKernel.fs;
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
		fsApi,
		startupConfiguration
	);

	return kernel;
}
