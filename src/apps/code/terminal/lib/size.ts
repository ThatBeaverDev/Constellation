const pathinf = await env.include("/System/CoreLibraries/pathinf.js");

export default async function size(parent: any, directory: string) {
	const dir = parent.env.fs.relative(parent.path, directory);

	const inf = await pathinf.pathSize(dir);

	return Math.round(inf.value * 100) / 100 + " " + inf.units;
}
