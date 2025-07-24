import TerminalAlias from "../../../lib/terminalAlias";

const mime = await env.include("/System/CoreLibraries/mime.js");

export default async function wget(
	parent: TerminalAlias,
	url: string,
	output: string
) {
	const out = output || env.fs.relative(parent.path, url.textAfterAll("/"));

	const textCharacters: string[] =
		"QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890!@£$%^&*()-=_+[]{};'\\:\"|,./<>?`~§±œ∑´®†¥¨^øπåß∂ƒ©˙∆˚¬Ω≈ç√∫~µ`¡€#¢∞§¶•ªº–≠“‘…æ«≤≥÷⁄™‹›ﬁﬂ‡°·‚—±Œ„‰ÂÊÁËÈØ∏”’ÅÍÎÏÌÓÔÒÚÆ»ŸÛÙÇ◊ıˆ˜¯˘¿".split(
			""
		);
	// yes, I pressed every key on the macOS keyboard including option and option + shift keys, yes this *should* include all windows typables.

	const data: string = await (await fetch(url)).text();
	const split: string[] = data.split("");

	let isBinary = false;

	for (const char in split) {
		const character = split[char];

		if (!textCharacters.includes(character)) {
			isBinary = false;
			break;
		}
	}

	let content;
	if (isBinary) {
		// make data:uri
		const mimeType = mime.getType(out.textAfterAll("."));

		content = `data:${mimeType},${data}`;
	} else {
		content = data;
	}

	parent.env.fs.writeFile(out, content);
}
