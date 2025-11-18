import { ApplicationAuthorisationAPI } from "../security/env.js";

/**
 * The type which is exposed to CLI utilities as a proxy to the executing app, providing a standardised interface.
 */
export default interface TerminalAlias {
	/**
	 * The Shell's Working Directory
	 */
	path: string;
	/**
	 * The Authorisation API of the Shell
	 */
	env: ApplicationAuthorisationAPI;
	/**
	 * Clears logs onscreen
	 */
	clearLogs: () => void;
	/**
	 * The Path of the executable of the host process
	 */
	origin: string;
}
