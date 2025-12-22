import TerminalAlias from "/System/lib/terminalAlias";
import * as manifest from "/System/manifest";

const ascii =
	"                         \n               ##        \n        ##      ###      \n    ######      #####    \n     #######    ######   \n      ###       ######   \n                #######  \n             #########   \n   ###    ############   \n    #################    \n      #############      \n         #######         \n                         ";

function millisecondsToDuration(ms: number) {
	const roundedSeconds = Math.floor(ms / 1000);

	const days = Math.floor(roundedSeconds / 86400);
	const daysOverflow = roundedSeconds % 86400;

	const hours = Math.floor(daysOverflow / 3600);
	const hourOverflow = daysOverflow % 3600;

	const minutes = Math.floor(hourOverflow / 60);

	return (
		days +
		(days == 1 ? " Day, " : " Days, ") +
		hours +
		(hours == 1 ? " Hour, " : " Hours, ") +
		minutes +
		(minutes == 1 ? " min" : " mins")
	);
}

export default async function systemInformation(parent: TerminalAlias) {
	const lines = ascii.split("\n");

	const userinf = parent.env.users.userInfo(parent.env.user);
	const totalProcesses = await parent.env.processes.total();

	let i = 0;
	function line(text: string) {
		lines[i++] += text;
	}

	line(`${userinf?.name + "@"}${manifest.name}`);
	line(`---------------`);
	line(`OS: ${manifest.version} ${manifest.keyword}`);
	line(`Uptime: ${millisecondsToDuration(parent.env.systemUptime)}`);
	line(`Shell: ${parent.origin}`);
	line(`Processes: ${totalProcesses}`);
	line(`Interface: ${parent.env.systemType}`);

	for (const i in lines) {
		lines[i] += "";
	}

	return lines.join("\n");
}
