import { MessageError } from "../errors.js";
import { getProcessFromID, processes } from "./apps.js";

export type replyCallback = (data: any) => void | undefined;

export function sendMessage(
	originDirectory: string,
	originID: number,
	targetID: number,
	intent: string,
	data: any = {},
	replyCallback?: replyCallback
) {
	const target = getProcessFromID(targetID);
	if (target == undefined)
		throw new MessageError(
			`Process with PID of '${target}' is not running. (sending message with intent '${intent}')`
		);

	const onmessageFunction = target?.onmessage;

	const onmessage = onmessageFunction.bind(target);

	const msg = new IPCMessage(
		originDirectory,
		originID,
		targetID,
		intent,
		data,
		replyCallback
	);
	onmessage(msg);
}

export class IPCMessage {
	origin: `${string}:${number}`;
	originDirectory: string;
	target: number;
	data: any;
	intent: string;
	private replyCallback?: replyCallback;
	hasReplyCallback: boolean = false;

	constructor(
		originDirectory: string,
		originID: number,
		target: number,
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
			this.replyCallback = replyCallback;
			this.hasReplyCallback = true;
		}
	}

	reply(data: any) {
		if (this.replyCallback !== undefined) {
			this.replyCallback(data);
		} else {
			throw new MessageError("This message has no reply callback.");
		}
	}
}
