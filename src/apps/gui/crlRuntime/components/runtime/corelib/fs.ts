import {
	RuntimeCallable,
	RuntimeList,
	RuntimeNone,
	RuntimeScope,
	RuntimeValue
} from "../../definitions.js";
import { DynamicScope } from "../scopes/DynamicScope.js";
import { CrlRuntime } from "../runtime.js";
import { unwrapValue, wrapValue } from "../utils.js";

export default class FilesystemAPI extends DynamicScope {
	constructor(
		runtime: CrlRuntime,
		public isDebug: boolean = false
	) {
		super(runtime, isDebug);
		function none(): RuntimeNone {
			return { type: "none", value: null };
		}
		const debug = isDebug
			? this.runtime.parent.debug
			: (...args: any[]) => {};
		const hostFS = this.runtime.app.env.fs;

		const createDir: RuntimeCallable = async (
			scopes: RuntimeScope[],
			path: RuntimeValue
		) => {
			if (path.type !== "string") {
				throw new Error("Path must be string");
			}

			const result = await hostFS.createDirectory(
				unwrapValue(path, debug)
			);

			if (!result.ok) throw result.data;
			const done = result.data;

			return wrapValue(done, debug);
		};
		this.newScopeFunction("createDir", createDir);

		const listDir = async (scopes: RuntimeScope[], path: RuntimeValue) => {
			if (path.type !== "string") {
				throw new Error("Path must be string");
			}

			const result = await hostFS.listDirectory(unwrapValue(path, debug));
			if (!result.ok) throw result.data;

			const wrapped: RuntimeList = {
				type: "list",
				value: result.data.map((item) => {
					return {
						type: "string",
						value: item
					};
				})
			};

			return wrapped;
		};
		this.newScopeFunction("listDir", listDir);

		const removeDir: RuntimeCallable = async (
			scopes: RuntimeScope[],
			path: RuntimeValue
		) => {
			if (path.type !== "string") {
				throw new Error("Path must be string");
			}

			const result = await hostFS.deleteDirectory(
				unwrapValue(path, debug)
			);

			if (!result.ok) throw result.data;
			const done = result.data;

			return wrapValue(done, debug);
		};
		this.newScopeFunction("removeDir", removeDir);

		const writeFile: RuntimeCallable = async (
			scopes: RuntimeScope[],
			path: RuntimeValue,
			contents: RuntimeValue
		) => {
			if (path.type !== "string") {
				throw new Error("Path must be string");
			}

			if (contents.type !== "string") {
				throw new Error("Contents must be string");
			}

			const result = await hostFS.writeFile(
				unwrapValue(path, debug),
				unwrapValue(contents, debug)
			);

			if (!result.ok) throw result.data;
			const done = result.data;

			return wrapValue(done, debug);
		};
		this.newScopeFunction("writeFile", writeFile);

		const removeFile: RuntimeCallable = async (
			scopes: RuntimeScope[],
			path: RuntimeValue
		) => {
			if (path.type !== "string") {
				throw new Error("Path must be string");
			}

			const result = await hostFS.deleteFile(unwrapValue(path, debug));

			if (!result.ok) throw result.data;
			const done = result.data;

			return wrapValue(done, debug);
		};
		this.newScopeFunction("removeFile", removeFile);

		const readFile: RuntimeCallable = async (
			scopes: RuntimeScope[],
			path: RuntimeValue
		) => {
			if (path.type !== "string") {
				throw new Error("Path must be string");
			}

			const result = await hostFS.readFile(unwrapValue(path, debug));

			if (!result.ok) throw result.data;
			const contents = result.data;

			return wrapValue(contents, debug);
		};
		this.newScopeFunction("readFile", readFile);

		const move: RuntimeCallable = async (
			scopes: RuntimeScope[],
			oldPath: RuntimeValue,
			newPath: RuntimeValue
		) => {
			if (oldPath.type !== "string") {
				throw new Error("Source path must be string");
			}
			if (newPath.type !== "string") {
				throw new Error("Target path must be string");
			}

			await hostFS.move(
				unwrapValue(oldPath, debug),
				unwrapValue(newPath, debug)
			);

			return none();
		};
		this.newScopeFunction("move", move);

		const stat: RuntimeCallable = async (
			scopes: RuntimeScope[],
			path: RuntimeValue
		) => {
			if (path.type !== "string") {
				throw new Error("Path must be string");
			}

			const result = await hostFS.stat(unwrapValue(path, debug));

			if (!result.ok) throw result.data;
			const stats = result.data;

			// TODO: build an object.
			stats;

			// dead end
			throw none();
		};
		this.newScopeFunction("stat", stat);

		const getFileType: RuntimeCallable = async (
			scopes: RuntimeScope[],
			path: RuntimeValue
		) => {
			if (path.type !== "string") {
				throw new Error("Path must be string");
			}

			const result = await hostFS.typeOfFile(unwrapValue(path, debug));

			return wrapValue(result, debug);
		};
		this.newScopeFunction("getFileType", getFileType);

		const resolve: RuntimeCallable = async (
			scopes: RuntimeScope[],
			base: RuntimeValue,
			target: RuntimeValue
		) => {
			if (base.type !== "string") {
				throw new Error("Base path must be string");
			}
			if (target.type !== "string") {
				throw new Error("Target must be string");
			}

			const result = hostFS.resolve(
				unwrapValue(base, debug),
				unwrapValue(target, debug)
			);

			return wrapValue(result, debug);
		};
		this.newScopeFunction("resolve", resolve);

		const relative: RuntimeCallable = async (
			scopes: RuntimeScope[],
			from: RuntimeValue,
			to: RuntimeValue
		) => {
			if (from.type !== "string") {
				throw new Error("Origin path must be string");
			}
			if (to.type !== "string") {
				throw new Error("Target path must be string");
			}

			const result = hostFS.relative(
				unwrapValue(from, debug),
				unwrapValue(to, debug)
			);

			return wrapValue(result, debug);
		};
		this.newScopeFunction("relative", relative);
	}
}
