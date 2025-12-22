import ConstellationKernel from "../../../kernel";
import { UiKitRendererClass } from "../uiKit";

export default class UiKitAudioSystem {
	#audio: UiKitAudio[] = [];
	#parent: UiKitRendererClass;
	#ConstellationKernel: ConstellationKernel;

	constructor(
		parent: UiKitRendererClass,
		ConstellationKernel: ConstellationKernel
	) {
		this.#parent = parent;
		this.#ConstellationKernel = ConstellationKernel;
	}

	async newAudio(path: string) {
		const contents = await this.#ConstellationKernel.fs.readFile(path);
		if (!contents || !contents.startsWith("data:")) return;

		const audio = new UiKitAudio(this.#parent, contents, () => {
			this.#audio = this.#audio.filter((item) => item !== audio);
		});
		this.#audio.push(audio);

		return audio;
	}

	terminate() {
		this.#audio.forEach((item) => item.terminate());
		this.#audio = [];
	}
}

export class UiKitAudio {
	#audio: HTMLAudioElement;
	#parent: UiKitRendererClass;
	#isPlaying: boolean = false;
	#onTerminate: Function;

	constructor(
		parent: UiKitRendererClass,
		dataURI: string,
		onTerminate: () => any
	) {
		this.#audio = new Audio(dataURI);
		this.#parent = parent;
		this.#parent;

		this.#onTerminate = onTerminate;
	}

	set playbackTime(value: number) {
		this.#audio.currentTime = value;
	}
	get playbackTime() {
		return this.#audio.currentTime;
	}

	get duration() {
		return this.#audio.duration;
	}

	get hasFinished() {
		return this.#audio.ended;
	}

	set loop(value: boolean) {
		this.#audio.loop = value;
	}
	get loop() {
		return this.#audio.loop;
	}

	set isMuted(value: boolean) {
		this.#audio.muted = value;
	}
	get isMuted() {
		return this.#audio.muted;
	}

	get isSeeking() {
		return this.#audio.seeking;
	}

	set volume(value: number) {
		this.#audio.volume = value;
	}
	get volume() {
		return this.#audio.volume;
	}

	get playing() {
		return this.#isPlaying;
	}
	set playing(play: boolean) {
		if (play) {
			this.play();
		} else {
			this.pause();
		}
	}

	play() {
		this.#audio.play();
		this.#isPlaying = true;
	}

	pause() {
		this.#audio.pause();
		this.#isPlaying = false;
	}

	terminate() {
		this.#onTerminate();

		this.pause();
		this.#audio.currentTime = 0;

		// remove metadata
		this.#audio.src = "";
		this.#audio.load();

		this.#audio.remove();
	}
}
