import applyStringPrototypes from "../system/stringPrototypes.js";

applyStringPrototypes();

export async function runTests(
	tests: { args: any[]; function: Function; expectedResult: any }[]
) {
	try {
		let passes = 0;
		let totalTests = 0;
		let logs = "";

		for (const test of tests) {
			try {
				let result: any = "none";

				let error: any;
				try {
					result = await test.function(...test.args);
				} catch (e) {
					error = e;
				}

				let isOK =
					JSON.stringify(result) ==
					JSON.stringify(test.expectedResult);

				if (isOK) {
					passes++;
					logs += `[/] PASSED: ${JSON.stringify(test.args)} is ${JSON.stringify(test.expectedResult)}.\n`;
				} else {
					if (result == "none")
						logs += `[ ] FAILED: ${JSON.stringify(test.args)} threw this error \`${error}\`, rather than returning ${JSON.stringify(test.expectedResult)}\n`;
					else
						logs += `[ ] FAILED: ${JSON.stringify(test.args)} returned ${JSON.stringify(result)}, not ${JSON.stringify(test.expectedResult)}.\n`;
				}
			} catch (e) {
				logs += `[ ] FAILED: ${String(e)} was thrown within tester.`;
			}
			totalTests++;
		}

		logs += `\n${passes} / ${totalTests} tests passed.`;

		return {
			passes,
			tests: totalTests,
			logs
		};
	} catch (e) {
		console.log("runTests failed: " + e);
		return {
			passes: 0,
			tests: 0,
			logs: ["0 / 0 tests passed. runtests failed:" + String(e)]
		};
	}
}
