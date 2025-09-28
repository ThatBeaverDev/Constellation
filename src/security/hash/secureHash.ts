/// <reference path="../../../node_modules/@types/node/index.d.ts" />

import { exec } from "child_process";
import { readFile, writeFile } from "fs/promises";
import { hash } from "./hash.js";

const result = await new Promise((resolve: (value: string) => void) =>
	exec(`find ./build -name "*.js"`, (err, stdout, stderr) => {
		resolve(stdout);
	})
);

const files = result
	.split("\n")
	.filter((item) => !["", " ", "\n", "\t"].includes(item));
const hashes: string[] = [];

for (const file of files) {
	const contents = await readFile(file, "utf8");

	const text = await hash(contents);

	hashes.push(text);
}

await writeFile(
	"./build/security/hashes.json",
	JSON.stringify(hashes, null, 4)
);
