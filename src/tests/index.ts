import * as fs from "./fs.js";
import * as applications from "./applications.js";

const tests: any = {
	filesystemTests: {
		names: fs.testNames,
		tests: fs.default
	},
	applicationsTests: {
		names: applications.testNames,
		tests: applications.default
	}
};

interface testResult {
	passed: boolean;
	reason: any | Error;
}

export default async function test() {
	const results: any = {};

	async function executeTest(name: string, test: Function): Promise<undefined> {
		const obj: testResult = {
			passed: true,
			reason: undefined
		};

		try {
			obj.reason = await test();
		} catch (error) {
			obj.passed = false;
			obj.reason = error;
		}

		if (!obj.passed) {
			console.error(obj.reason);
		}

		results[name] = obj;
	}

	for (const i in tests) {
		switch (typeof tests[i]) {
			case "function":
				await executeTest(i, tests[i]);
				break;
			case "object":
				{
					const obj = tests[i];
					const names = obj.names;
					const functions = obj.tests;

					for (const name of names) {
						await executeTest(i + ": " + name, functions[name]);
					}
				}
				break;
			default:
				throw new Error("Test exported type " + typeof tests[i] + " which has no execution case");
		}
	}

	const formatted: any = {};

	let passed = 0;
	let total = 0;
	for (const i in results) {
		total++;
		if (results[i].passed) {
			passed++;
		}
	}

	let percentagePassed = (passed / total) * 100;
	formatted.percent = Math.round(percentagePassed * 100) / 100 + "%";
	formatted.total = total;
	formatted.passed = passed;
	formatted.fraction = passed + "/" + total;
	formatted._passingData = results;

	if (percentagePassed == 100) {
		console.log("Testing Results: ", formatted);
	} else {
		if (percentagePassed > 75) {
			console.warn("Testing Results: ", formatted);
		} else {
			console.error("Testing Results: ", formatted);
		}
	}
}
