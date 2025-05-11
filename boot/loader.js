// bootloader for Constellation / Constellation Based Systems.

function mustBootWithoutFSAPI() {
	let obj = {
		noFS: false
	}
	if (window.showSaveFilePicker == undefined) {
		obj.noFS = true
		obj.reason = "File_System_API"
		obj.showReason = "Filesystem API"
	}
	return obj
}


async function loader() {

	const Name = "/boot/loader.js"
	const PID = 0

	system.startTime = Date.now()
	document.getElementById("display").innerHTML = `<div id="logoBox" style="display: flex; justify-content: space-around"></div>
		<div id="logsBox" style="display: flex; justify-content: space-around"></div>
		<div style="display: flex; justify-content: space-around">
			<p id="preInput">system is loading. if this text persists with no logs, the system may have crashed.</p>
			<!--<input type="text" id="input" onkeypress="search(event)">-->
		</div>`

	let bootedPercentage

	system.baseURI = window.location.protocol + "//" + window.location.host + window.location.pathname

	if (system.baseURI.at(-1) == "/") {
		system.baseURI = system.baseURI.substring(0, system.baseURI.length - 1)
	}

	system.license = "GPL-3.0 License"

	system.versions = {
		loader: "v0.3.0"
	};

	if (system.fastBoot) {
		system.fsAPI = false // so I don't have to constantly make a new system to update it
	}

	obj = mustBootWithoutFSAPI()

	if (obj.noFS) {
		system.warn(Name, "Attempting to boot without the filesystem API, things might get a bit rocky...")
		system.fsAPI = false
	}

	system.fetchURL = async function fetchURL(url) {
		const oldTask = String(system.task)
		system.task = "fetchURL"
		system.log(Name, "fetchURL request to " + url)
		let response
		let data
		try {
			response = await fetch(url);
			data = await response.text();
		} catch (e) {
			console.warn(e)
			return undefined
		}
		system.task = oldTask
		if (response.ok) {
			return data;
		} else {
			console.warn(response)
			return undefined
		}
	}

	markAsBooted("fetchURL")

	system.asciiName = await system.fetchURL(system.baseURI + '/nameAscii.txt')

	document.getElementById("logoBox").innerHTML = system.asciiName






































	// START FILESYSTEM
	system.fs = {}
	system.vfs = {}
	system.vfsMan = {}

	system.fsErrors = []
	system.fs.directory = (permissions = {
		"owner": {
			"user": "root",
			"read": true,
			"write": true,
			"execute": true
		},
		"group": {
			"group": "root",
			"read": true,
			"write": true,
			"execute": false
		},
		"others": {
			"read": true,
			"write": false,
			"execute": false
		}
	}) => {

		const obj = {
			permissions: permissions,
			children: {}
		}

		return obj
	}

	system.fs.file = (ext, content, safeMode) => {

		if (ext == undefined) {
			throw new Error("extension and content MUST be defined when creating a file.")
		}

		const byteSize = str => new Blob([str]).size;

		const obj = {
			type: `.${ext}`,
			contents: content,
			created: Date.now(),
			edited: Date.now()
		}

		if (!safeMode) {
			obj.size = byteSize(JSON.stringify(obj))
			obj.size = byteSize(JSON.stringify(obj))
		}

		return obj
	}


	system.fs.link = (target) => {
		if (target == undefined) {
			throw new Error("target MUST be defined when creating a link.")
		}

		const byteSize = str => new Blob([str]).size;

		const obj = {
			type: "dir",
			target: target,
			created: Date.now(),
			edited: Date.now()
		}

		obj.size = byteSize(JSON.stringify(obj))
		obj.size = byteSize(JSON.stringify(obj))

		return obj
	}

	function longestStringInArray(input) {
		try {
			return input.reduce((a, b) => a.length <= b.length ? b : a)
		} catch (e) {
			console.debug(input)
			throw e
		}
	}

	function getDirInfo(dirOld) {
		try {
			const obj = {}
			let dir = String(dirOld) // use to replace ~ with home dir in future
			let location = dir.substring(0, dir.lastIndexOf("/"))
			if (location == "") {
				location = "/"
			}
			obj.location = location
			obj.filename = dir.substring(dir.lastIndexOf("/") + 1)
			obj.ext = obj.filename.substring(obj.filename.lastIndexOf(".") + 1)
			obj.dir = dir

			const vfs = []

			for (const i in system.vfs) {
				if (dirOld.startsWith(i)) {
					vfs.push(i)
				}
			}

			obj.vfs = longestStringInArray(vfs)

			obj.vfsInf = system.vfs[obj.vfs]

			return obj
		} catch (e) {
			throw {
				error: e,
				directory: dirOld
			}
		}
	}

	system.vfsMan.rawFile = (directory, fs) => {
		const obj = getDirInfo(directory)
		return fs[obj.location].children[obj.filename]
	}

	function permissionsCheck(directory, username, permission, rootOverride = true, fs) {
		const obj = getDirInfo(directory)

		try {
			if (fs[obj.location].children[obj.filename] == undefined) {
				return false
			}
		} catch (e) {
			return false
		}

		if (username == "root" && rootOverride) {
			// root is genuinely god here
		} else {
			const permissions = system.fs.folderPermissions(obj.location)
			let key = "others"
			if (permissions.owner.user == username) {
				key = "owner"
			}

			const access = permissions[key][permission]
			if (access !== true) {
				throw system.fs.errors.noPermission(username)
			}
		}
	}

	// FILES!

	system.vfsMan.writeFile = function (directory, content, username = "root", fs) {
		try {

			const obj = getDirInfo(directory)

			if (fs[obj.location] == undefined) {
				throw new Error(`Parent directory ${obj.location} does not exist.`)
			}

			if (fs[obj.location].children[obj.filename] !== undefined) {

				permissionsCheck(directory, username, "write", true, fs)

				const file = system.vfsMan.rawFile(directory, fs)
				file.contents = content
				return {
					result: true
				}
			}

			const file = system.fs.file(obj.ext, content)
			fs[obj.location].children[obj.filename] = file
			return {
				result: true,
			}
		} catch (e) {
			console.warn(e);

			system.fsErrors.push({
				origin: "writeFile",
				error: e
			})
			return {
				result: false,
				error: e
			}
		}
	}

	system.vfsMan.readFile = function (directory, attribute = "contents", username = "root", fs) {

		const obj = getDirInfo(directory)

		try {
			if (fs[obj.location].children[obj.filename] == undefined) {
				return undefined
			}
		} catch (e) {
			return undefined
		}

		if (attribute !== "permissions") {
			permissionsCheck(directory, username, "read", true, fs)
		}

		try {
			const file = fs[obj.location].children[obj.filename]

			if (file == undefined) {
				return undefined
			}

			return file[attribute]
		} catch (e) {
			if (String(e).startsWith("TypeError: Cannot read properties of undefined")) {
				return undefined
			}
			console.warn("readFile: " + e + " reading " + directory)
			return undefined
		}
	}

	system.vfsMan.deleteFile = function (directory, username = "root", fs) {

		const obj = getDirInfo(directory)

		try {
			if (fs[obj.location].children[obj.filename] == undefined) {
				return undefined
			}
		} catch (e) {
			return undefined
		}

		permissionsCheck(directory, username, "write", true, fs)

		try {
			delete fs[obj.location].children[obj.filename]

			return fs[obj.location].children[obj.filename] == undefined
		} catch (e) {
			return {
				result: false,
				error: e
			}
		}
	}

	// FOLDERS!

	system.vfsMan.writeFolder = function (directory, usr = "root", fs) {

		if (fs[directory] !== undefined) {
			return {
				result: true,
				reason: "Directory already exists!"
			}
		}

		const obj = getDirInfo(directory)

		if (fs[obj.location] == undefined) {
			throw system.fs.errors.parentNotReal(directory)
		}

		let username = usr

		if (username == undefined) {
			username = fs[obj.location].permissions.owner.user
		}

		permissionsCheck(directory, username, "write", true, fs)

		try {
			const link = system.fs.link(obj.dir)
			const dir = system.fs.directory()

			fs[obj.dir] = dir
			fs[obj.location].children[obj.filename] = link
			return {
				result: true
			}
		} catch (e) {
			console.warn(e);

			system.fsErrors.push({
				origin: "writeFolder",
				error: e
			})
			return {
				result: false,
				error: e
			}
		}
	}

	system.vfsMan.listFolder = function (directory, username = "root", fs) {
		if (fs == undefined) {
			console.debug(fs)
			throw new Error("SYSERROR: VFS DOES NOT EXIST [UNDEFINED]")
		}
		if (fs[directory] == undefined) {
			console.debug(fs)
			throw new Error(`Directory '${directory}' does not exist.`)
		}


		permissionsCheck(directory, username, "read", true, fs)

		try {
			return Object.keys(system.vfsMan.rawFolder(directory, username, fs).children)
		} catch (e) {
			return {
				result: false,
				error: e
			}
		}
	}

	system.vfsMan.deleteFolder = function (directory, username = "root", fs) {

		if (fs[directory] == undefined) {
			throw new Error(`Directory ${directory} does not exist.`)
		}

		permissionsCheck(directory, username, "write", true, fs)

		try {
			const obj = getDirInfo(directory)

			const list = system.vfsMan.listFolder(directory, username, fs)

			if (list.length !== 0) {
				return {
					result: false,
					reason: "Directory is not empty."
				}
			}

			let direct = String(directory)

			if (direct.at(-1) !== "/") {
				direct += "/"
			}

			delete fs[obj.location].children[obj.filename]
			delete fs[directory]
			return {
				result: true
			}
		} catch (e) {
			return {
				result: false,
				error: e
			}
		}
	}

	system.vfsMan.folderPermissions = function (directory, username = "root", fs) {
		try {
			if (directory == "/") {
				return system.vfsMan.rawFolder("/", username, fs).permissions
			}

			let perms = system.vfsMan.rawFolder(directory, username, fs).permissions
			return perms
		} catch (e) {
			console.warn(e);

			system.fsErrors.push({
				origin: "folderPermissions",
				error: e,
				args: [
					directory
				]
			})
			return undefined
		}
	}

	system.vfsMan.rawFolder = function (directory, username, fs) {

		permissionsCheck(directory, username, "read", true, fs)

		return fs[directory]
	}

	system.vfsMan.isFolder = function (directory, fs) {
		try {
			if (directory == "/") return true

			const obj = getDirInfo(directory)

			const link = fs[obj.location].children[obj.filename]

			const type = link.type

			return type == "dir"
		} catch (e) {
			return false
		}
	}

	system.vfsMan.exists = function (directory, fs) {
		const obj = getDirInfo(directory)

		try {
			return fs[directory] !== undefined
		} catch (e) {
			return false
		}
	}

	// newFS

	const getVFS = (directory) => {
		//try {
		const obj = getDirInfo(directory)

		let vfsDir = directory.textAfter(obj.vfs)

		if (vfsDir[0] !== "/") {
			vfsDir = "/" + vfsDir
		}

		return {
			vfs: obj.vfsInf,
			vfsDir: vfsDir
		}
		//} catch (e) {
		//	console.warn(e)
		//	return {
		//		vfs: undefined,
		//		vfsDir: "/"
		//	}
		//}
	}
	system.fs.getVFS = getVFS

	// File operations
	system.fs.readFile = (directory, attribute = "contents", username = "root") => {
		const obj = getVFS(directory)
		return system.vfsMan.readFile(obj.vfsDir, attribute, username, obj.vfs)
	}

	system.fs.writeFile = (directory, content, username = "root") => {
		const obj = getVFS(directory)
		return system.vfsMan.writeFile(obj.vfsDir, content, username, obj.vfs)
	}

	system.fs.deleteFile = (directory, username = "root") => {
		const obj = getVFS(directory)
		return system.vfsMan.deleteFile(obj.vfsDir, username, obj.vfs)
	}


	// Folder operations
	system.fs.listFolder = (directory, username = "root") => {
		const obj = getVFS(directory)
		return system.vfsMan.listFolder(obj.vfsDir, username, obj.vfs)
	}

	system.fs.writeFolder = (directory, username = "root") => {
		const obj = getVFS(directory)
		return system.vfsMan.writeFolder(obj.vfsDir, username, obj.vfs)
	}

	system.fs.deleteFolder = (directory, username = "root") => {
		const obj = getVFS(directory)
		return system.vfsMan.deleteFolder(obj.vfsDir, username, obj.vfs)
	}

	system.fs.rawFolder = (directory, username = "root") => {
		const obj = getVFS(directory)
		return system.vfsMan.rawFolder(obj.vfsDir, username, obj.vfs)
	}

	system.fs.isFolder = (directory) => {
		const obj = getVFS(directory)
		return system.vfsMan.isFolder(obj.vfsDir, obj.vfs)
	}

	system.fs.folderPermissions = (directory, username = "root") => {
		const obj = getVFS(directory)
		return system.vfsMan.folderPermissions(obj.vfsDir, username, obj.vfs)
	}


	// Typeless operations (files AND folders)
	system.fs.exists = (directory) => {
		const obj = getVFS(directory)
		return system.vfsMan.exists(obj.vfsDir, obj.vfs)
	}

	system.blankVFS = () => {
		return {
			"/": system.fs.directory()
		};
	};

	system.newVFS = (directory, vfsVar, link = true) => {

		system.log(Name, `VFS in ${directory} has been created and mounted.`)

		if (link == true) {
			const vfs = getVFS(directory)
			const obj = getDirInfo(vfs.vfsDir)

			const link = system.fs.link(obj.dir)

			vfs.vfs[obj.location].children[obj.filename] = link
		}

		system.vfs[directory] = vfsVar;
	}

	system.delVFS = (directory, link = true) => {
		const vfsInfo = system.vfs[directory]

		if (link) {
			const vfs = getVFS(directory)

			const obj = getDirInfo(directory)

			delete vfs.vfs[obj.location].children[obj.filename]
		}

		system.stopProcess(vfsInfo.PID)

		delete system.vfs[directory]
	}

	markAsBooted("vfs")

	// REMOVE! // why? this is how the filesystem gets created? I think we need the filesystem to work.
	system.memory.kernel.rootFS = system.blankVFS()
	system.newVFS("/", system.memory.kernel.rootFS, false)

	// temp directory
	system.memory.kernel.tmpVFS = system.blankVFS()
	system.newVFS("/tmp", system.memory.kernel.tmpVFS, true)

	// processes directory
	system.memory.kernel.procVFS = system.blankVFS()
	system.newVFS("/proc", system.memory.kernel.procVFS, true)

	// FILESYSTEM ERRORS

	system.fs.errors = {}
	system.fs.errors.noPermission = function (username) {
		return new Error(`Access Denied; User ${username} does not have access to this file.`)
	}
	system.fs.errors.parentNotReal = function (directory) {
		return new Error(`Operation Failed: Parent directory of ${directory} does not exist.`)
	}

	markAsBooted("fs")











	// run cryptography so we can do user login stuff

	if (system.fsAPI == true) {
		window.onbeforeunload = () => {
			return true;
		};
	}

	markAsBooted("localFS")

	const handle = (e) => {
		switch (e.key) {
			case "Enter":
				e.preventDefault();
				system.progress = true
				break;
			case "ArrowUp":
				system.selection--
				e.preventDefault();
				break;
			case "ArrowDown":
				e.preventDefault();
				system.selection++
				break;
		}
	}

	if (!system.fsAPI) {
		markAsBooted("bootloader")
		await bootOS("New", system)
		return
	}

	document.addEventListener('keydown', handle)

	system.progress = false
	system.selection = 0
	system.options = ["Open", "New"]
	document.getElementById('preInput').innerText = "Select an option from above to boot Constellation."


	system.post("", "")

	markAsBooted("bootSelection")
	const loop = setInterval(function () {
		if (system.progress) {
			try {
				markAsBooted("bootloader")
				bootOS(system.options[system.selection], system)
				document.removeEventListener('keydown', handle)
			} catch (e) {
				console.error(e)
				system.progress = false
			}
			clearInterval(loop)
			return
		} else {
			if (system.selection < 0) {
				system.selection = 0
			} else if (system.selection > system.options.length - 1) {
				system.selection = system.options.length - 1
			}
			const opt = JSON.parse(JSON.stringify(system.options))
			opt[system.selection] = "> " + opt[system.selection]

			system.logs[0].content = opt.join("\n")

			system.logsBox.innerText = system.logs[0].content
		}
	}, 100)

	await new Promise(function (resolve) {
		setInterval(function () {
			if (system.progress) {
				setTimeout(resolve, 250)
			}
		}, 100)
	})
}

async function bootOS(osName, ssm) {
	if (ssm.getParam("noBoot") == "true") {
		return
	}

	console.debug("Loading Filesystem...")


	const system = ssm;
	// delete bootloader keys
	delete system.progress;
	delete system.selection;
	delete system.options;
	let castoreaKernel;

	const kernelDir = "/boot/castoreaKernel.js";

	switch (String(osName).toLowerCase()) {
		case "open":
			// open file picker
			[system.fileHandle] = await window.showOpenFilePicker(system.localFS.options);
			const fileData = await system.fileHandle.getFile();

			// extract the text of the file
			const text = await fileData.text();
			const data = JSON.parse(text);

			const errors = system.fs.errors

			switch (data.version) {
				case "v0.3.0":
					system.memory.processes[0].fs = data.fs
					break;
				case "v0.4.0":
					system.memory.processes[0].fs = data.fs
					break;
				default:
					throw new Error("Filesystem file not supported.");
			}

			system.fs.errors = errors


			// run kernel
			castoreaKernel = system.fs.readFile(kernelDir);
			break;
		case "new":
			if (system.fsAPI) {
				system.fileHandle = await window.showSaveFilePicker(system.localFS.options);
			}
			system.isNew = true;

			// fetch kernel since it's not present yet to be ran
			system.fs.writeFolder("/boot");
			const kern = await system.fetchURL(system.baseURI + kernelDir); // kernel download
			system.fs.writeFile(kernelDir, kern);
			castoreaKernel = system.fs.readFile(kernelDir);

			break;
		default:
			throw new Error("Unknown Case: " + osName);
	}

	if (castoreaKernel == undefined) {
		console.debug(castoreaKernel)
		throw new Error("This instance does not contain a valid kernel.")
	}

	console.debug("Running Kernel")

	const getKernel = new Function(castoreaKernel);
	const kernel = getKernel();

	kernel(system, kernelDir, 0, []) // run the kernel!
}

try {
	loader()
} catch (e) {
	console.error(e)
	document.getElementById("display").innerHTML = e.stack
}