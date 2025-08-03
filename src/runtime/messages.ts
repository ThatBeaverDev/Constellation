import { MessageError } from "../errors.js";
import { getProcessFromID, processes } from "./runtime.js";
import { Process } from "./executables.js";

export type replyCallback = (data: any) => void | undefined;

export function sendMessage(
	originDirectory: string,
	originID: number,
	target: Process | number,
	intent: string,
	data: any = {},
	replyCallback?: replyCallback
) {
	let targetProcess;

	if (target instanceof Process) {
		targetProcess = target;
	} else {
		targetProcess = getProcessFromID(target);

		if (targetProcess == undefined)
			throw new MessageError(
				`Process with PID of '${target}' is not running. (sending message with intent '${intent}')`
			);
	}

	const onmessageFunction = targetProcess?.onmessage;

	const onmessage = onmessageFunction.bind(targetProcess);

	const msg = new IPCMessage(originDirectory, originID, targetProcess, intent, data, replyCallback);
	onmessage(msg);
}

export class IPCMessage {
	origin: `${string}:${number}`;
	originDirectory: string;
	target: Process;
	data: any;
	intent: string;
	#replyCallback?: replyCallback;
	hasReplyCallback: boolean = false;

	constructor(
		originDirectory: string,
		originID: number,
		target: Process,
		intent: string,
		data: any,
		replyCallback?: replyCallback
	) {
		this.origin = `${originDirectory}:${originID}`;
		this.originDirectory = originDirectory;
		this.target = target;
		this.intent = intent;
		this.data = data;

		if (typeof replyCallback == "function") {
			this.#replyCallback = replyCallback;
			this.hasReplyCallback = true;
		}
	}

	reply(data: any) {
		if (this.#replyCallback !== undefined) {
			this.#replyCallback(data);
		} else {
			throw new MessageError("This message has no reply callback.");
		}
	}
}
