import * as path from "path";

const packageName = "" // use to package a node package for web as a library

/** @type {import('webpack').Configuration} */
export default {
	entry: `./${packageName}.js`,
	output: {
		path: path.resolve(process.cwd(), 'dist'),
		filename: `${packageName}.bundle.js`,
		library: {
			type: 'module',
		},
		module: true,
	},
	experiments: {
		outputModule: true,
	},
	mode: 'production',
};
