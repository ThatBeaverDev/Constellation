export const applicationName = "__APP__";

const manifest: ApplicationManifest = {
	name: `${applicationName} Uninstaller`,
	description: `Constellation's provided uninstaller for ${applicationName}.`,
	category: "Developer",
	author: "ThatBeaverDev",
	version: 1,
	icon: "package-minus",
	userspace: false
};

export default manifest;
