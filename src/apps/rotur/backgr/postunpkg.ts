export default async function postUnpackage(directory: string) {
	const lib = await env.fs.readFile(
		env.fs.resolve(directory, "resources/lib.js")
	);
	await env.fs.writeFile("/System/CoreLibraries/rotur.js", lib.data);
}
