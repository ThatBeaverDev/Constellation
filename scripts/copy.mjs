import { cp, mkdir, readdir } from "fs/promises";
import { join } from "path";

const srcDir = "src";
const outDir = "build";
const blacklistFileExtensions = [".js", ".mjs", "cjs", ".jsx", ".ts", ".tsx"];
const blacklistDirectories = ["src/apps/app-template/node_modules", "src/apps/app-template/.git", "src/apps/types"]

async function copyFiles(dir = "") {
	const fullSrc = join(srcDir, dir);
	const fullOut = join(outDir, dir);
	await mkdir(fullOut, { recursive: true });

	const entries = await readdir(fullSrc, { withFileTypes: true });
	for (const entry of entries) {
		const srcPath = join(fullSrc, entry.name);
		const outPath = join(fullOut, entry.name);


		const allowedFile = (() => {
			for (const item of blacklistFileExtensions) {
				if (entry.name.endsWith(item)) {
					return false;
				}
			}

			return true;
		})();

		if (blacklistDirectories.includes(srcPath)) continue;

		if (entry.isDirectory()) {
			await copyFiles(join(dir, entry.name));
		} else if (allowedFile) {
			console.log((srcPath + " ").padEnd(75, "-") + "> " + outPath);
			await cp(srcPath, outPath);
		}
	}
}

await copyFiles();
