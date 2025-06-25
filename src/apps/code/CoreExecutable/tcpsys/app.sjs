export default class initialiser extends BackgroundProcess {
	init() {
		const onstart = ["/System/CoreExecutables/com.constellation.finder"];

		for (const app of onstart) {
			this.os.exec(app);
		}
	}

	async keydown(key, cmd, opt, ctrl, shift, isRepeat) {
		if (key == "Space" && opt) {
			// search
			//this.os.exec("/System/CoreExecutables/com.constellation.search");

			const checkDir = async (/*dir*/ directory, name) => {
				//const directory = env.fs.resolve(dir)

				const list = (await env.fs.listDirectory(directory)).data;

				if (list.includes(name)) {
					return env.fs.relative(directory, name);
				}

				for (const item of list) {
					if (item.endsWith("." + name)) {
						return env.fs.relative(directory, item);
					}
				}
			};

			const choice = prompt("Enter the application name:");

			const sys = await checkDir("/System/CoreExecutables", choice);

			if (sys !== undefined) {
				env.exec(sys);
				return;
			}

			alert("App " + choice + " was not found.");

			//const user = await checkDir("~/Applications", choice)
			//
			//if (sys !== undefined) {
			//	env.exec(sys)
			//}
		}
	}
}
