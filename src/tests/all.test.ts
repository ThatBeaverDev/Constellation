/// <reference path="../../node_modules/@types/node/index.d.ts" />
import { exec } from "child_process";
import path from "path";

if (typeof global == "undefined") {
	throw new Error("Tests must be run in nodejs!");
}

// string utilities
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

// get whether we are hiding successful tests
let hideSuccessfulTests = false;
process.argv.forEach((item) => {
	if (item == "--hideSuccess") hideSuccessfulTests = true;
});

// list files
const filepath = "./" + path.relative(process.cwd(), process.argv[1]);

const result = await new Promise((resolve: (data: string) => void) =>
	exec(`find ./build -name "*.test.js"`, (err, stdout, stderr) => {
		resolve(stdout);
	})
);

const files = result.split("\n").filter((item) => item !== "");

let totalSuccesses = 0;
let totalTests = 0;
const badFormats: string[] = [];

for (const i in files) {
	if (filepath == files[i]) continue;

	const result = await new Promise((resolve: (data: string) => void) => {
		exec(`node ${files[i]}`, (err, stdout, stderr) => {
			resolve(stdout);
		});
	});

	const lastLine = result.trim().textAfterAll("\n");

	const passed = Number(lastLine.textBefore(" "));
	const tests = Number(lastLine.textAfter(" / ").textBefore(" "));

	if (isNaN(passed) || isNaN(tests)) {
		console.log(
			"File " +
				files[i] +
				" did not format the result properly. results are hidden."
		);
		badFormats.push(files[i]);
		continue;
	} else {
		console.log("### " + files[i]);

		if (hideSuccessfulTests) {
			const logs = result
				.split("\n")
				.filter((item) => !item.startsWith("[/] PASSED"))
				.join("\n");

			console.log(logs);
		} else console.log(result);
	}

	totalSuccesses += passed;
	totalTests += tests;
}

const percentage = (totalSuccesses / totalTests) * 100;

console.log("");

if (badFormats.length !== 0) {
	console.log(
		"The following files were badly formatted and excluded:\n" +
			badFormats.join("\n")
	);
	console.log("");
}

console.log(
	`TOTAL: ${totalSuccesses} / ${totalTests} tests passed. (${Math.round(percentage)}%)`
);
