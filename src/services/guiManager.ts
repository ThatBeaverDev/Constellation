import { ServiceManifest } from "../apps/services/CoreExecutable/components/serviceManager.js";

const manifest: ServiceManifest = {
	directory: "/System/CoreExecutables/guiManager.appl",
	restart: "always",
	graphicalOnly: true
};

export default manifest;
