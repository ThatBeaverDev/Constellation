import TerminalAlias from "../../../../system/lib/terminalAlias.js";

export type softwareupdateResult =
	| {
			state: "notNeeded";
	  }
	| {
			state: "needed";
			info: (typeof import("../../../../system/versionmanifest.js"))["default"];
	  }
	| { state: "checking" };

export default async function softwareupdate(
	parent: TerminalAlias,
	command: "statusjson"
): Promise<softwareupdateResult>;
export default async function softwareupdate(
	parent: TerminalAlias,
	command: string
): Promise<any> {
	const currentBuild = (await parent.env.include("/System/buildver.js"))
		.buildNumber;

	switch (command) {
		case "build":
			return `Build Number: ${currentBuild}`;
		case "statusjson": {
			const remoteBuildVer = (
				await import(
					`https://${window.location.host}/build/system/buildver.js`
				)
			).buildNumber as number;

			const isOutdated = remoteBuildVer > currentBuild;

			if (!isOutdated) {
				const result: softwareupdateResult = {
					state: "notNeeded"
				};

				return result;
			} else {
				const result: softwareupdateResult = {
					state: "needed",
					info: (
						await import(
							`https://${window.location.host}/build/system/versionmanifest.js`
						)
					).default
				};

				return result;
			}
		}
		case "install":
			parent.env.exec(
				"/System/CoreExecutable/SoftwareUpdateHandler.srvc",
				[]
			);

			break;
		default:
			return `Commands:\nbuild`;
	}
}
