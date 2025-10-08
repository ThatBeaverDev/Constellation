import { ServiceManifest } from "../apps/background/CoreExecutable/components/serviceManager.js";

const manifest: ServiceManifest = {
	directory: "/System/CoreExecutables/guiManager.appl",
	restart: "always",
	graphicalOnly: true
};

export default manifest;
