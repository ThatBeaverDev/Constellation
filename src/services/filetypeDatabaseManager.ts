import { ServiceManifest } from "../apps/background/CoreExecutable/components/serviceManager.js";

const manifest: ServiceManifest = {
	directory: "/System/CoreExecutables/filetypeDatabaseManager.backgr",
	restart: "always"
};

export default manifest;
