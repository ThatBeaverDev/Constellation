import { Permission } from "../../../../../../security/permissions.js";
import {
	RuntimeBoolean,
	RuntimeCallable,
	RuntimeNone,
	RuntimeScope,
	RuntimeValue
} from "../../definitions.js";
import { DynamicScope } from "../scopes/DynamicScope.js";
import { CrlRuntime } from "../runtime.js";
import { unwrapValue } from "../utils.js";

export default class PermissionsAPI extends DynamicScope {
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

		const setPermission: RuntimeCallable = async (
			scopes: RuntimeScope[],
			path: RuntimeValue,
			permission: RuntimeValue,
			value: RuntimeValue
		) => {
			if (path.type !== "string")
				throw new Error("Path must be of type string.");

			// TODO: check if this is actually a valid permission
			if (permission.type !== "string")
				throw new Error("Permission must be of type string.");

			if (value.type !== "boolean")
				throw new Error("Value must be of type string.");

			this.runtime.app.env.setDirectoryPermission(
				unwrapValue(path, debug),
				// @ts-expect-error
				unwrapValue(permission, debug),
				unwrapValue(value, debug)
			);

			return none();
		};
		this.newScopeFunction("setPermission", setPermission);

		const hasPermission: RuntimeCallable = async (
			scopes: RuntimeScope[],
			permission: RuntimeValue
		) => {
			// TODO: check if this is actually a valid permission
			if (permission.type !== "string")
				throw new Error("Permission must be of type string.");

			const perm = unwrapValue(permission, debug) as Permission;

			const obj: RuntimeBoolean = {
				type: "boolean",
				value: this.runtime.app.env.hasPermission(perm)
			};

			return obj;
		};
		this.newScopeFunction("hasPermission", hasPermission);

		const requestPermission: RuntimeCallable = async (
			scopes: RuntimeScope[],
			permission: RuntimeValue
		) => {
			// TODO: check if this is actually a valid permission
			if (permission.type !== "string")
				throw new Error("Permission must be of type string.");

			const perm = unwrapValue(permission, debug) as Permission;

			const obj: RuntimeBoolean = {
				type: "boolean",
				value:
					(await this.runtime.app.env.requestUserPermission(perm)) ==
					true
			};

			return obj;
		};
		this.newScopeFunction("requestPermission", requestPermission);
	}
}
