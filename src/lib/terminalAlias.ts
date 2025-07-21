import { ApplicationAuthorisationAPI } from "../security/env";

export default interface TerminalAlias {
	path: string;
	env: ApplicationAuthorisationAPI;
	logs: any[];
	clearLogs: () => void;
	origin: string;
}
