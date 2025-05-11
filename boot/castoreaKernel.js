async function start_kernel() {

	const Name = "/boot/castoreaKernel.js"
	const PID = 0
	const args = []

	system.name = "Constellation - v0.5.0 (Dabli)"

	// patchovers for modules until they are included
	system.fetchURL = async (url) => {
		return (await fetch(url)).text()
	}
	system.baseURI = "."
	system.writeFileQueue = []

	const processes = system.processes

	const include = async function (name) {
		const dir = "/lib/modules/" + name + ".js";

		let content
		try {
			content = system.fs.readFile(dir);
		} catch (e) {
			if (!e instanceof TypeError) {
				throw e
			}
		}

		if (content == undefined) {
			content = await system.fetchURL(system.baseURI + "/lib/modules/" + name + ".js");

			if (content == undefined) {
				throw new Error("Content of module " + name + " is blank.");
			};

			let dir = "/lib/modules/" + name + ".js"
			try {
				system.fs.writeFile(dir, content);
			} catch (e) {
				if (e instanceof TypeError) {
					system.writeFileQueue.push({
						directory: dir,
						content: content
					})
				} else {
					throw e
				}
			}
			try {
				system.log(Name, `Kernel module ${name} now present (downloaded)`)
			} catch { }
		};

		content = `const moduleName = "/lib/modules/${name}.js";\n\n${content}`

		const fnc = new system.asyncFunction("system", "Name", "PID", "args", "initram", content);

		const out = await fnc(system, Name, PID, args, initram);

		return out;
	};

	system.asyncFunction = Object.getPrototypeOf(async function () { }).constructor;

	let obj = {
		isCompatible: true
	}
	if ((crypto || {}).subtle == undefined) {
		obj.isCompatible = false
		obj.reason = "Crypto/subtle"
		obj.showReason = "crypto.subtle"
	}

	if (!obj.isCompatible) {
		system.error(Name, "Sorry, but your browser is not compatible with This System.")
		if (obj.showReason == undefined) obj.Showreason = obj.reason
		system.error(Name, 'Reason is your browser does not support <a href="https://developer.mozilla.org/en-US/docs/Web/API/' + obj.reason + '">' + obj.showReason + '</a>')
		document.getElementById("preInput").innerText = ""
		return
	}

	await include("stringUtils");
	await include("logging");
	await include("misc");
	await include("controlVariables");
	// input not included because i think it's not needed
	await include("cryptography");

	system.logs = []

	system.versions = {}

	// https://patorjk.com/software/taag/#p=display&h=0&f=Doom&t=Constellation 
	system.asciiName = " _____                     _          _  _         _    _               \n/  __ \\                   | |        | || |       | |  (_)              \n| /  \\/  ___   _ __   ___ | |_   ___ | || |  __ _ | |_  _   ___   _ __  \n| |     / _ \\ | '_ \\ / __|| __| / _ \\| || | / _` || __|| | / _ \\ | '_ \\ \n| \\__/\\| (_) || | | |\\__ \\| |_ |  __/| || || (_| || |_ | || (_) || | | |\n \\____/ \\___/ |_| |_||___/ \\__| \\___||_||_| \\__,_| \\__||_| \\___/ |_| |_|\n"
	system.post("", system.asciiName)
	system.post("", " ")
	//document.getElementById('preInput').innerText = "Please wait..."

	system.log(Name, "Starting JS Engine...")

	system.languages = {}
	system.langBackend = {} // need to remove but CRL needs it
	system.languages.js = function (dir, safe) {
		// code provided by node

		// code gets provided 'dir' and 'safe'
		let script = system.fs.readFile(dir)

		return script
	}

	system.focus = [];
	system.fcs = undefined;
	system.mainFcs = undefined;

	function getParentOfDir(dir) {
		if (dir == "/") {
			return "/"
		}

		const reversed = dir.split("").reverse().join("")
		const reversedParent = reversed.substring(reversed.indexOf("/") + 1)
		const parent = reversedParent.split("").reverse().join("")

		if (parent == "") {
			return "/"
		}

		return parent
	}

	system.toDir = function toDir(directory, baseDir = "/") {

		if (directory == undefined) {
			console.debug(directory)
			console.debug(baseDir)
			throw new Error("Directory may not be undefined.")
		}

		let dir = directory.split("")
		if (dir[0] + dir[1] == "..") {
			dir[0] = getParentOfDir(baseDir)
			dir.splice(1, 1)
			if (dir[1] == "/") {
				dir.splice(1, 1)
			}
		} else if (dir[0] == ".") {
			dir[0] = baseDir
		}

		dir = dir.join("")

		if (dir[0] == "/") {
			return dir
		} else if (baseDir.at(-1) == "/") {
			return baseDir + dir
		}
		return baseDir + "/" + dir
	}

	//try {

	await include("panic");
	await include("drivers");
	await include("processes")
	await include("vfs")
	await include("fs")

	let sysState = system.fs.readFile("/sysState.json")

	if (sysState !== undefined) {
		if (sysState.isNew == true) {
			system.isNew = true
		} else {
			system.isNew = false
		}
		system.fs.deleteFile("/sysState.json")
	}


	await include("calls")
	await include("users")
	await include("devsys")
	await include("dsm")
	await include("gamepad")


	system.fs.writeFile("/var/log", system.logs)
	system.logs = system.fs.readFile("/var/log")
	system.refreshLogsPanel()

	// initiate PATH

	system.path = system.fs.readFile("/etc/path.json")

	if (system.isNew) {
		// install system
		let packages = await system.fetchURL(system.baseURI + "/index.json")
		system.index = JSON.parse(packages).packages
	}

	const clock = system.fs.readFile("/etc/sysconfig/clock");
	clock.ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

	await system.startProcess(PID, "/bin/aurora.js", ["sources", "add", "http://localhost:555/aurora"], true) // source local for devs
	await system.startProcess(PID, "/bin/aurora.js", ["sources", "add", "https://thatbeaverdev.github.io/aurora"], true) // source the repo for installs


	if (system.isNew) {
		await system.startProcess(PID, "/bin/aurora.js", ["update"], true) // update package repositories

		await system.startProcess(PID, "/bin/aurora.js", ["install", "aurora", "-s"], true)

		// install
		await system.startProcess(PID, "/bin/aurora.js", ["install", system.index, "-s"], true)

		delete system.index // remove the index from memory

		system.log(Name, "System successfully Installed!")
	}


	document.title = system.fs.readFile('/etc/hostname')

	system.display = document.getElementById("display");
	system.refreshDisplay = function () {

		if (system.devices.display.owner !== 0) {
			return
		}

		if (system.focus.length !== 0) {
			system.display.innerHTML = processes[system.mainFcs].display
		} else {
			system.display.innerHTML = "No Application is outputting display information. Sorry, You'll have to restart the system, there is no real way to access a CLI from here."
		}
	}

	system.maxPID = 0

	system.log(Name, "Starting init system...")
	await system.startProcess(PID, "/sbin/init.js", [], true)

	system.log(Name, "Beginning to run processes...")

	system.runtime = setInterval(function () {
		try {

			for (let i = 0; i < system.runsPerMS; i++) {
				system.runProcesses();
				system.handleDisplay();
			};

		} catch (e) {
			system.kernelPanic(e, "PROCESS RUNNER")
		}
	}, 0);

	setTimeout(system.localFS.commit, 1000)
	system.commit = setInterval(system.localFS.commit, 5000)
	//} catch (e) {
	//	system.kernelPanic(e, "UNKNOWN")
	//}
}

return start_kernel;