import { ServiceManifest } from "../apps/services/CoreExecutable/components/serviceManager.js";

const manifest: ServiceManifest = {
	directory: "/System/CoreExecutables/filetypeDatabaseManager.srvc",
	restart: "always"
};

export default manifest;
