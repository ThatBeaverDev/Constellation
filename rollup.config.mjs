// rollup.config.mts
import dts from "rollup-plugin-dts";

export default {
	input: "types/global.d.ts",
	output: {
		file: "src/apps/types/constellation.d.ts",
		format: "es"
	},
	plugins: [dts()],
	onwarn(warning, warn) {
		// suppress "Circular dependency" warnings
		if (warning.code === "CIRCULAR_DEPENDENCY") return;
		warn(warning);
	}
};
