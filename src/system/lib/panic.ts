import ConstellationKernel from "../kernel.js";

// TODO: panic
export default async function panic(
	ConstellationKernel: ConstellationKernel,
	error: any,
	source?: string
) {
	ConstellationKernel.ui.panic("panic :>");
}

//import { processes } from "../runtime/runtime.js";
//
//// Global error handler
//window.onerror = function (
//	message: string | Event,
//	source?: string,
//	lineno?: number,
//	colno?: number,
//	error?: Error
//) {
//	panic(error, source);
//	console.error(error);
//};
//
//// Global unhandled promise rejection handler
////window.onunhandledrejection = function (event: PromiseRejectionEvent) {
////	panic(event.reason);
////};
//
//// ASCII Art for "Constellation" from patorjk.com (Doom font)
//const asciiName = `
// _____                     _          _  _         _    _
///  __ \\                   | |        | || |       | |  (_)
//| /  \\/  ___   _ __   ___ | |_   ___ | || |  __ _ | |_  _   ___   _ __
//| |     / _ \\ | '_ \\ / __|| __| / _ \\| || | / _\` || __|| | / _ \\ | '_ \\
//| \\__/\\| (_) || | | |\\__ \\| |_ |  __/| || || (_| || |_ | || (_) || | | |
// \\____/ \\___/ |_| |_||___/ \\__| \\___||_||_| \\__,_| \\__||_| \\___/ |_| |_|
//`;
//
//const snappyMessages = [
//	"oops",
//	"my bad",
//	"forgot doing that caused an error",
//	":(",
//	"ouch",
//	"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
//	"noooo",
//	"uhm.",
//	"not my fault!",
//	"!%@%^&@^%^#**&!!$&#$**$$$&^^!$*&#$@#@^&$!#%&%#*&###^%%**!@^$!!%&!***$@^^!$!&^*!@%&%#%%%&&##@@%^!*!$%@!%#^&&$$%&!$^!&&!$*^$$%&*$*",
//	"uh oh",
//	"yikes",
//	"pain",
//	"this was avoidable",
//	"how did we get here?",
//	"welp.",
//	"it broke itself",
//	"not again...",
//	"well, that's unfortunate",
//	"error vibes",
//	"whoopsie",
//	"this is fine",
//	"I didn’t see that coming",
//	"nope",
//	"just walk it off",
//	"guess we’re done here",
//	"404: brain not found",
//	"it’s not you, it’s me",
//	"blame the compiler",
//	"turn it off and on again?",
//	"voided warranty",
//	"broke faster than I loaded",
//	"nothing to see here",
//	"i’ll pretend this didn’t happen",
//	"this will be reported"
//];
//
//const noPanic =
//	new URL(window.location.href).searchParams.get("nopanic") == null;
//
//export default async function panic(error: any, source?: string) {
//	if (noPanic) return;
//
//	// Wait briefly to allow any last async logs to flush or UI updates
//	await new Promise((resolve) => setTimeout(resolve, 500));
//
//	// Stop all intervals and timeouts
//	const highestTimerId = Number(setTimeout(() => {}, 0));
//	for (let i = 0; i <= highestTimerId; i++) {
//		clearInterval(i);
//		clearTimeout(i);
//	}
//
//	// Terminate all running processes
//	for (const pid in processes) {
//		processes[pid].program.exit();
//	}
//
//	// Stop further document loading and rendering
//	window.stop();
//
//	// Create a full viewport overlay to show error info
//	const textDiv = document.createElement("div");
//	Object.assign(textDiv.style, {
//		position: "absolute",
//		left: "0",
//		top: "0",
//		width: "100vw",
//		height: "100vh",
//		backgroundColor: "rgba(34, 109, 62, 1)",
//		color: "#ffffff",
//		fontFamily: "monospace, monospace",
//		whiteSpace: "pre-wrap",
//		overflowY: "auto",
//		padding: "25px",
//		boxSizing: "border-box",
//		zIndex: "9999"
//	});
//
//	let txt = "";
//	function text(line: string) {
//		txt += line + "\n";
//	}
//
//	text(
//		"Constellation has Crashed - an Error within Constellation itself was hit. " +
//			snappyMessages[Math.floor(Math.random() * snappyMessages.length)]
//	);
//	text(String(error) + "\n");
//	text("Time:\n  " + new Date().toISOString());
//	text("Origin:\n  " + String(source ?? "unknown"));
//	text("Error Trace:\n  " + (error?.stack ?? String(error)));
//
//	// display text onscreen
//	textDiv.textContent = asciiName + "[" + keyword + "]\n\n" + txt;
//
//	// create github issue report link
//	const title =
//		`ConstellationKernelPanic '${conf.keyword}': ` +
//		(error?.message ?? "Unknown Error") +
//		" in " +
//		(source ?? "unknown");
//
//	const ascii = "\n" + asciiName + "[" + conf.keyword + "]\n\n";
//	const json = "\n```JSON\n" + JSON.stringify(conf, null, 4) + "\n```";
//
//	const description =
//		"```" + ascii + txt + "```\nSystem Configuration:" + json;
//	const githubReportLink =
//		"https://github.com/ThatBeaverDev/Constellation/issues/new?title=" +
//		encodeURIComponent(title) +
//		"&body=" +
//		encodeURIComponent(description);
//
//	// add report link
//	const link = document.createElement("a");
//	link.href = githubReportLink;
//	link.textContent = "Report this crash";
//	link.target = "_blank";
//	link.style.color = "#ffffff";
//	link.style.display = "block";
//	link.style.marginTop = "2em";
//	link.style.textDecoration = "underline";
//
//	textDiv.appendChild(link);
//
//	// Append to body to show panic screen
//	document.body.appendChild(textDiv);
//}
//
