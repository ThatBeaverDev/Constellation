declare global {
	interface String {
		textAfter(after: string): string;
		textAfterAll(after: string): string;
		textBefore(before: string): string;
		textBeforeLast(before: string): string;
	}
}
String.prototype.textAfter = function (after) {
	return this.split(after).splice(1, Infinity).join(after);
};

String.prototype.textAfterAll = function (after) {
	return this.split(after).pop() ?? "";
};

String.prototype.textBefore = function (before) {
	return this.substring(0, this.indexOf(before));
};

String.prototype.textBeforeLast = function (before) {
	return this.split("")
		.reverse()
		.join("")
		.textAfter(before)
		.split("")
		.reverse()
		.join("");
};

export async function runTests(
	tests: { args: any[]; function: Function; expectedResult: any }[]
) {
	let passes = 0;
	let totalTests = 0;
	let logs = "";

	for (const test of tests) {
		let result: any = "none";

		let error: any;
		try {
			result = await test.function(...test.args);
		} catch (e) {
			error = e;
		}

		let isOK =
			JSON.stringify(result) == JSON.stringify(test.expectedResult);

		if (isOK) {
			passes++;
			logs += `[/] PASSED: ${JSON.stringify(test.args)} is ${JSON.stringify(test.expectedResult)}.\n`;
		} else {
			if (result == "none")
				logs += `[ ] FAILED: ${JSON.stringify(test.args)} threw this error \`${error}\`, rather than returning ${JSON.stringify(test.expectedResult)}\n`;
			else
				logs += `[ ] FAILED: ${JSON.stringify(test.args)} returned ${JSON.stringify(result)}, not ${JSON.stringify(test.expectedResult)}.\n`;
		}

		totalTests++;
	}

	logs += `\n${passes} / ${totalTests} tests passed.`;

	return {
		passes,
		tests: totalTests,
		logs
	};
}
