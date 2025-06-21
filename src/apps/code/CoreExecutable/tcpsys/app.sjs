export default class initialiser extends BackgroundProcess {
	init() {
		const onstart = ["/System/CoreExecutables/com.constellation.finder"];

		for (const app of onstart) {
			this.os.exec(app);
		}
	}
}
