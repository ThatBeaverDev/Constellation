async function start_kernel() {
	const Name = "/boot/castoreaKernel.js"
	const PID = 0

	system.name = "Constellation - v0.5.0 (Dabli)"

	const processes = system.processes

	try {
		system.logs = []

		system.versions.castoreaKernel = "v0.5.0";
		system.versions.terminal = system.versions.castoreaKernel;

		// https://patorjk.com/software/taag/#p=display&h=0&f=Doom&t=Constellation 
		system.post("", system.asciiName)
		system.post("", " ")
		//document.getElementById('preInput').innerText = "Please wait..."

		system.temp = await system.fetchURL("/beaverUtils.js")
		eval(system.temp)
		delete system.temp

		system.log(Name, "Starting JS Engine...")

		system.languages = {}
		system.langBackend = {} // need to remove but CRL needs it
		system.languages.js = function (dir, safe) {
			// code provided by node

			// code gets provided 'dir' and 'safe'
			let script = system.fs.readFile(dir)

			for (const i in csw.functions) {
				script = script.replaceAll(csw.functions[i] + "(", csw.functions[i] + "(token,")
			}

			return script
		}

		system.extend = function (pre, text) {
			let txt = String(text.replaceAll("\n", "\n ")).split("(")
			let result = ""

			for (const i in txt) {
				let item = txt[i]
				if (Number(i) !== txt.length - 1) {
					if (item[item.length - 1] !== " ") {
						let tmp = item.split(" ").reverse()
						let post = tmp.splice(0, 1)[0]
						let prea = tmp.reverse().join(" ")

						result += prea + " " + pre + "." + post + "("
					} else {
						result += item + "("
					}
				} else {
					result += item
				}
			}
			return result
		}

		system.asyncFunction = Object.getPrototypeOf(async function () { }).constructor;

		system.startProcess = async function (parentPID, dir, args = [], unsafe = false, stdin = null, usr, useSharedMemory = false) {
			system.task = "startProcess"
			system.maxPID++
			const isUnsafe = unsafe;
			if (system.fs.readFile(dir) == undefined) {
				return
			}
			let user = usr;
			if (user == undefined) {
				user = system.processes[parentPID].token.user
			}
			const PID = system.maxPID;
			const tokenID = csw.permissions.newToken(PID, user);

			// code ran internally before the actual process's code
			let preScript = "const PID = " + system.maxPID + ";"
			preScript += "const Name = '" + dir + "';"
			preScript += "const args = " + JSON.stringify((args || [])) + ";"
			preScript += "const elevated = " + !isUnsafe + ";"
			preScript += "const token = " + tokenID + ";"
			preScript += "const local = lcl;"
			preScript += "const parent = prn;"
			preScript += "const std = stud;"
			if (isUnsafe) {
				preScript += "const system = ssm;"
			}

			// code ran AFTER the process
			const afterCode = `\nlet SYS_FRAME_EXPORT;\nlet SYS_TERMINATE_EXPORT;\ntry {\n\tSYS_FRAME_EXPORT = frame;\n} catch (e) {};\ntry {\n\tSYS_TERMINATE_EXPORT = terminate;\n} catch (e) {};\n\nreturn {\n\tstd: std,\n\tframe: SYS_FRAME_EXPORT,\n\tterminate: SYS_TERMINATE_EXPORT\n};`

			let code
			let type = "js"
			const file = system.fs.readFile(dir)
			if (file.substring(0, 3) == "#! ") {
				const split = file.split("\n")
				const handler = split[0].substring(3)
				const handleFunc = new Function("cde", "sfe", "system", system.fs.readFile(handler).replaceAll("#!", "//") + "\n\nreturn compile(cde, sfe)")
				split.shift()
				code = handleFunc(split.join("\n"), !isUnsafe, system)
			} else {
				type = String(dir).substring(String(dir).indexOf(".") + 1)
				try {
					if (system.languages[type] == undefined && [undefined, null, ""].includes(type)) {
						throw new Error("Error while trying to compile: Language not found and no shebang")
					}
					code = system.languages[type](dir)
				} catch (e) {
					system.error(`Error hit trying to compile script ${dir}, language: '${type}'`)
				}
			}

			system.memory.processes[PID] = {
				shared: {
					name: dir
				},
				std: {
					in: structuredClone(stdin),
					out: ""
				}
			}

			const procVFS = system.memory.kernel.procVFS

			const procDir = "/" + PID

			system.vfsMan.writeFolder(procDir, "root", procVFS);
			system.vfsMan.writeFile(procDir + "/cmdline", `${dir} ${args.join(" ")}`, "root", procVFS);
			system.vfsMan.writeFile(procDir + "/exe", `${dir}`, "root", procVFS);
			system.vfsMan.writeFile(procDir + "/args", `${args}`, "root", procVFS);


			const obj = {}

			obj.name = dir;
			obj.PID = PID;
			obj.children = [];
			obj.parent = parentPID;
			obj.isUnsafe = isUnsafe;
			obj.args = args;
			obj.cwd = "/";
			obj.useSharedMemory = useSharedMemory;
			obj.token = {
				user: user,
				root: system.processes[parentPID].token.root
			};
			obj.tokenID = tokenID;
			obj.frame = "initRunning";


			code = preScript + code;
			obj.code = code;

			obj.hasFrame = obj.code.includes("frame()");

			obj.display = `<p>Application ${dir}, PID ${PID} has no display output.</p>`;

			system.systemWrapper = Boolean(system.systemWrapper);

			// so we can make an Async function for init
			const AsyncFunction = system.asyncFunction;

			let frame;
			let terminate;

				if (isUnsafe) {
					if (system.safe && system.systemWrapper) {
						// safe mode, unsafe and systemWrapper
						frame = new Function("lcl", "prn", "stud", "ssm", obj.code + "\ntry {  frame(args) } catch(e) {  console.error(token, Name, e)  };" + afterCode)
						terminate = new Function("lcl", "prn", "stud", "ssm", obj.code + "\ntry {  terminate(args) } catch(e) {  console.error(token, Name, e)  };" + afterCode)
						obj.init = new AsyncFunction("lcl", "prn", "stud", "ssm", obj.code + "\ntry {  await init(args) } catch(e) {  console.error(token, Name, e)  };" + afterCode)
					}

					if (!system.safe) {
						// no safe mode, unsafe
						frame = new Function("lcl", "prn", "stud", "ssm", obj.code + "\nframe(args);" + afterCode)
						terminate = new Function("lcl", "prn", "stud", "ssm", obj.code + "\nterminate(args);" + afterCode)
						obj.init = new AsyncFunction("lcl", "prn", "stud", "ssm", obj.code + "\nawait init(args);" + afterCode)
					}
				} else {
					if (system.safe) {
						// safe mode, not unsafe
						frame = new Function("lcl", "prn", "stud", obj.code + "\ntry {  frame(args) } catch(e) {  console.error(Name, e)  };" + afterCode)
						terminate = new Function("lcl", "prn", "stud", obj.code + "\ntry {  terminate(args) } catch(e) {  console.error(Name, e)  };" + afterCode)
						obj.init = new AsyncFunction("lcl", "prn", "stud", obj.code + "\ntry {  await init(args) } catch(e) {  console.error(Name, e)  };" + afterCode)
					}

					if (!system.safe) {
						// no safe mode, not unsafe
						frame = new Function("lcl", "prn", "stud", obj.code + "\nframe(args);" + afterCode)
						terminate = new Function("lcl", "prn", "stud", obj.code + "\nterminate(args);" + afterCode)
						obj.init = new AsyncFunction("lcl", "prn", "stud", obj.code + "\nawait init(args);" + afterCode)
					}
				}

			processes[obj.PID] = obj
			processes[obj.parent].children.push(obj.PID)

			const count = PID
			let initResult = {}
			const mem = system.memory.processes[count]
			let parentinf = {
				PID: obj.PID,
				name: system.processes[obj.parent].name
			}
			if (obj.useSharedMemory) {
				parentinf = system.memory.processes[obj.parent].shared
			}
			const oldRunningPID = Number(system.runningPID)
			system.runningPID = PID
			try {
				if (isUnsafe) {
					initResult = await obj.init(mem, parentinf, mem.std, system)
				} else {
					initResult = await obj.init(mem, parentinf, mem.std)
				}
			} catch (e) {
				console.error(Name + ": startProcess running " + obj.name, e)
				mem.std.out += "\n[ERR]" + e
			}
			system.runningPID = Number(oldRunningPID)

			if (initResult.frame == undefined) {
				frame = "noFrame"
			}

			if (initResult.frame == undefined) {
				terminate = "noTerminate"
			}

			obj.frame = frame
			obj.terminate = terminate
			
			system.task = undefined
			return {
				PID: count,
				process: obj,
				stdout: mem.std.out
			}
		}

		system.stopProcess = async function (PID, doNotStopIfHasChildren = false) {
			system.task = "stopProcess";
			if (Number(PID) < 0) return;

			if (doNotStopIfHasChildren) {
				if (processes[Number(PID)].children.length !== 0) {
					return false;
				}
			}
			
			const obj = processes[Number(PID)];

			if (obj.terminate !== "noTerminate") {

				const mem = system.memory.processes[PID]

				let parentinf = {
					PID: obj.PID,
					name: system.processes[obj.parent].name
				}
				if (obj.useSharedMemory) {
					parentinf = system.memory.processes[obj.parent].shared
				}
				const oldRunningPID = Number(system.runningPID)
				system.runningPID = Number(obj.PID)
				const result = await obj.terminate(mem, parentinf, mem.std);
				system.runningPID = Number(oldRunningPID)

			};

			if (PID == system.displayManager) {
				system.displayManager = false;
			}

			if (obj == undefined) return;

			if (system.focus.includes(Number(PID))) {
				console.log(`Process ${PID} has display focus. Removing.`);
				system.focus = system.focus.filter(item => Number(item) !== Number(PID));

				// refresh the display.
				system.refreshDisplay();
			};

			for (const i in obj.children) {
				const stop = system.stopProcess(obj.children[i], true);
				if (stop == true) {
					console.debug(system.proceseses[i])
					system.processes[i].parent = 1
				}
			};

			const parentChildren = processes[obj.parent].children;
			const index = parentChildren.indexOf(PID);
			parentChildren.splice(index, 1);

			delete system.csw.tokens[obj.tokenID];
			delete processes[Number(PID)];

			const procFiles = system.fs.listFolder("/proc/" + PID)
			for (const i in procFiles) {
				await system.fs.deleteFile("/proc/" + PID + "/" + procFiles[i])
			}

			system.fs.deleteFolder("/proc/" + PID)

			system.task = undefined;
			return true
		}

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

		if (system.isNew) {
			system.log(Name, "Creating Basic Directories...")

			let list = await system.fetchURL(system.baseURI + "/index.json")
			folders = JSON.parse(list).folders
			for (const item in folders) {
				system.fs.writeFolder(folders[item])
			}

			system.log(Name, "Writing Default Files...")

			files = JSON.parse(list).files
			for (const item in files) {
				if (typeof files[item] == "object") {
					obj = await system.fetchURL(system.baseURI + files[item].dir)
					if (files[item].parse) {
						obj = JSON.parse(obj)
					}
					system.fs.writeFile(files[item].dir, obj)
				} else {
					obj = await system.fetchURL(system.baseURI + files[item])
					system.fs.writeFile(files[item], obj)
				}
			}

			// fetch Aurora (package manager)
			obj = await system.fetchURL("../aurora/pkgs/aurora/src.js")
			system.fs.writeFile("/bin/aurora.js", obj)
		}

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

		// start user system
		system.user = "root"
		system.users = system.fs.readFile("/etc/passwd")

		system.userPasswordHash = async function (text) {
			const sha512 = await window.cryptography.sha512(text)

			const base64 = btoa(sha512)

			return base64
		}

		// function to register users
		system.users.register = async function (name, object) {

			const deflt = {
				userID: 0,
				groupID: 0,
				otherInfo: {},
				baseDir: "/",
				shell: "/bin/aquila.js",
				permissions: {
					all: false,
					read: false,
					write: false,
					delete: false
				}
			}

			const obj = { ...deflt, ...object }

			if (system.users[name] !== undefined) {
				throw new Error("user named " + name + " already exists!")
			}

			obj.userID = system.users.amount
			if (obj.password == undefined) {
				system.warn(Name, "User password was not defined: it is set to 'default'")
				obj.password = "default"
			}
			obj.password = await system.userPasswordHash(obj.password);
			console.debug(obj.password)

			if (obj.permissions == undefined) {
				obj.permissions = {}
			}
			const p = obj.permissions
			p.all = (p.all || false)
			p.read = (p.read || false)
			p.write = (p.write || false)
			p.delete = (p.delete || false)

			system.users[name] = obj
			if (system.fs.exists(obj.baseDir) !== true) {
				throw new Error(`User base directory (${obj.baseDir}) is not created`)
			} else {
				const d = obj.homeDir
				system.fs.writeFolder(d)
				system.fs.writeFolder(d + "/.profile")
				system.fs.writeFolder(d + "/.config")
			}

			return true
		}

		if (system.isNew) {
			system.log(Name, "Creating root user...")
			await system.users.register('root', {
				password: "admin",
				userID: 0,
				groupID: 0,
				otherInfo: {},
				baseDir: "/",
				homeDir: "/root",
				shell: "/bin/aquila.js",
				fullName: "root",
				permissions: {
					all: true,
					read: true,
					write: true,
					delete: true
				}
			})
		}

		system.csw = new Function("system", system.fs.readFile("/boot/csw.js"))
		system.csw(system)

		system.lib = new Function("system", system.fs.readFile("/boot/lib.js"))
		system.lib(system)

		// source the repo for installs
		await system.startProcess(PID, "/bin/aurora.js", ["source", "../aurora/pkgs", "as", "default"], true)

		if (system.isNew) {
			// install
			await system.startProcess(PID, "/bin/aurora.js", ["install", system.index, "-s"], true)

			delete system.index // remove the index from memory

			system.log(Name, "System successfully Installed!")
		}

		// source local for devs
		await system.startProcess(PID, "/bin/aurora.js", ["source", "http://localhost:555/aurora/pkgs", "as", "local"], true)

		document.title = system.fs.readFile('/etc/hostname')

		system.focus = []
		system.fcs = undefined
		system.mainFcs = undefined
		system.displayManager = false

		system.display = document.getElementById("display");
		system.refreshDisplay = function () {

			if (system.displayManager !== false) {
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
		if (!system.systemC) {
			system.error(Name, "systemC not running! System may Behave Weirdly!")
		}

		system.log(Name, "Beginning to run processes...")

		system.manageProcVFS = () => {

		}

		system.runProcesses = () => {
			try {

				system.isLooping = true

				const processes = system.processes

				const runnerStart = Date.now()

				if (system.displayManager == false) {
					system.fcs = system.focus[system.focus.length - 1]
					system.mainFcs = system.fcs
				}

				if (processes == undefined) {
					throw new Error("Processes is empty.")
				}

				for (const i in processes) {
					const obj = processes[i]
					// only run if defined and not the kernel
					if (obj !== undefined && obj.PID !== 0) {
						// check if the process is properly built, if not ignore it since init is still running
						if (obj.frame == "initRunning") {
							break;
						}

						// terminate if the process doesn't have a frame
						if (String(obj.frame) == "noFrame") {
							system.stopProcess(i);
							break;
						}

						const startTime = Date.now()
						// catch errors so one program can't crash them all
						try {
							const sharedVariables = system.memory.processes[obj.parent].shared

							const mem = system.memory.processes[i]
							let parentinf = {
								PID: obj.PID,
								name: system.processes[obj.parent].name
							}
							if (obj.useSharedMemory) {
								parentinf = system.memory.processes[obj.parent].shared
							}

							system.runningPID = Number(i)

							// run it
							if (obj.isUnsafe) {
								obj.frame(mem, parentinf, mem.std, system)
							} else {
								obj.frame(mem, parentinf, mem.std)
							}
							// no support for std sadly

						} catch (e) {
							console.error(Name + ": processRunner running " + obj.name, e.stack)
						}
						const endTime = Date.now()
						const time = endTime - startTime
						obj.time = time
					}
				}
				const runnerEnd = Date.now()
				const runnerTime = runnerEnd - runnerStart
				system.time = runnerTime
			} catch (e) {
				throw new Error(e)
			}
		}

		system.runtime = setInterval(function () {
			try {
				system.manageProcVFS()
				system.runProcesses()
			} catch (e) {
				system.kernelPanic(e, "PROCESS RUNNER")
			}
		}, 0);

		system.commit = setInterval(system.localFS.commit, 5000)
	} catch (e) {
		system.kernelPanic(e, "UNKNOWN")
	}
}

const system = ssm

system.kernelPanic = function (e, when = "When not provided.") {

	const snappyMessages = [
		"oops",
		"my bad",
		"forgot doing that caused an error",
		":(",
		"ouch",
		"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
		"noooo",
		"uhm.",
		"not my fault!"
	]

	var max = setTimeout(function () { /* Empty function */ }, 1);

	for (var i = 1; i <= max; i++) {
		window.clearInterval(i);
		window.clearTimeout(i);
		if (window.mozCancelAnimationFrame) window.mozCancelAnimationFrame(i); // Firefox
	}

	const systemPurged = {
		baseURI: system.baseURI,
		devMode: system.developer,
		fsAPI: system.fsAPI,
		maxPID: system.maxPID,
		safe: system.safe,
		softwareVersions: system.versions,
		cryptoSubtle: window.crypto == undefined,
	}

	try {
		systemPurged.processes = Object.keys(system.processes).length
	} catch (e) {
		systemPurged.processes = "Error reading process count."
	}

	try {
		const disk = JSON.stringify(system.fs)

		const byteSize = str => new Blob([str]).size;

		let diskSize = byteSize(disk)

		let unit = 1

		while (diskSize > 1024) {
			unit++
			diskSize /= 1024
		}

		let formatted = String(Math.round(diskSize))
		switch (unit) {
			case 1:
				formatted += " Bytes"
				break;
			case 2:
				formatted += " KiB"
				break;
			case 3:
				formatted += " MiB"
				break;
			case 4:
				formatted += " GiB"
				break;
			case 5:
				formatted += " TiB"
				break;
		}

		systemPurged.fsSize = String(formatted)
	} catch (e) {
		systemPurged.fsSize = "Error reading filesystem size."
	}

	const panic = `Kernel Panic - A Low Level Critical Error has been hit. ${snappyMessages[Math.floor(Math.random() * snappyMessages.length)]}\nTYPE: ${e.name}\nTASK: ${system.task}\nTIME: ${new Date(Date.now())}\nSTACK TRACE:\n${e.stack}`;

	const reportIssue = document.createElement("a")

	reportIssue.href = `https://github.com/ThatBeaverDev/Constellation/issues/new?title=${encodeURIComponent("Automatically Generated Error" + e)
		}&body=${encodeURIComponent(panic + "\n\n" + JSON.stringify(systemPurged, null, 4))
		}`;

	reportIssue.innerText = "Open a bug report"

	document.body.style.margin = "0px 10%"
	document.body.style.fontSize = "20px"
	document.body.style.fontWeight = `"Source Code Pro", serif`
	//document.body.style.textAlign = "center"
	document.body.style.justifyContent = "space-around"
	document.body.style.width = "100vw"
	document.body.innerHTML = `<div id="display">
	<p>${system.asciiName.replaceAll("\n", "<br>")}<br><br><b>${panic.replaceAll("\n", "<br>")}</b>
	<br>${reportIssue.outerHTML}
	</div>
	</p>`

	console.error(panic)
	console.debug("nothing after this is my fault. Kernel is bailing out.")
}

//return
return start_kernel