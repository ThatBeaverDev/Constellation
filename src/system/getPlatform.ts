const agent = navigator.userAgent;
const agentName = agent.substring(0, agent.indexOf("/"));

export const isNode = agentName == "Node.js";
export const isDeno = agentName == "Deno";
export const isBun = agentName == "Bun";
export const isCommandLine = isNode || isDeno || isBun;

export const isEdge = /Edge/.test(agent); // Detects Microsoft Edge
export const isChrome = /chrome/i.test(agent) && !isEdge; // Detects Chrome but excludes Edge
export const isSafari = /safari/i.test(agent) && !isEdge; // Detects Safari but excludes Edge
export const isMobile = /mobile/i.test(agent); // Detects if the user is on a mobile device
export const isIEWin7 = /Windows NT 6.1/i.test(agent) && /rv:11/i.test(agent); // Detects Internet Explorer 11 on Windows 7
export const isOldSafari =
	isSafari && (/Version\/8/i.test(agent) || /Version\/9/i.test(agent)); // Detects older versions of Safari
export const isFirefox = /firefox/i.test(agent);

export const isChromium = isEdge || isChrome;
export const isWebkit = isOldSafari || isSafari;
export const isGecko = isFirefox;
export const isTrident = isIEWin7;
export const isBrowser = isChromium || isWebkit || isGecko || isTrident;

export let platform:
	| "node"
	| "deno"
	| "bun"
	| "browser"
	| "browser:chromium"
	| "browser:webkit"
	| "browser:gecko"
	| "unknown" = "unknown";

if (isDeno) {
	platform = "deno";
	console.log("You are running Deno.");
} else if (isNode) {
	platform = "node";
	console.log("You are running Node.js.");
} else if (isBun) {
	platform = "bun";
	console.log("You are running Bun.");
} else if (isBrowser) {
	if (isChromium) {
		platform = "browser:chromium";
		console.log("You are running a Chromium-based browser.");
	} else if (isWebkit) {
		platform = "browser:webkit";
		console.log("You are running a Webkit-based browser.");
	} else if (isGecko) {
		platform = "browser:gecko";
		console.log("You are running a Gecko-based browser.");
	} else {
		platform = "browser";
		console.log("You are running a Browser.");
	}
} else {
	platform = "unknown";
	console.log("We cannot detect what environment you are running in.");
}
