import { ApplicationAuthorisationAPI } from "../security/env";

/**
 * The type which is exposed to CLI utilities as a proxy to the executing app, providing a standardised interface.
 */
export default interface TerminalAlias {
	path: string;
	env: ApplicationAuthorisationAPI;
	logs: any[];
	clearLogs: () => void;
	origin: string;
}
