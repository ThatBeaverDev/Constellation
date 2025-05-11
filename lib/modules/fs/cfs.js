const templates = {
	directory: (permissions = {
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
	},

	file: (ext, content, safeMode) => {

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
	},


	link: (target) => {
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
}

class fsDriver {
	constructor() {

	}

	getFilesystemChanges(fs) {
		return fs.changes
	}

	markFilesystemChange(directory, fs) {
		if (fs.changes == undefined) {
			fs.changes = [];
		};

		if (fs.changes.includes(directory)) {
			return
		}
		fs.changes.push(directory)
	};

	permissionsCheck(directory, username, permission, rootOverride = true, fs) {
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




	newFS() {
		return {
			"/": templates.directory()
		}
	}
	async readFS(GUID) {
		const vol = await system.fsBackend.readVol(GUID, "cfsData.json")

		const data = JSON.parse(vol)

		return data
	}
	async onUpdate(GUID, fs) {
		await system.fsBackend.writeVol(GUID, "cfsData.json", JSON.stringify(fs), false)
	}





	writeFile(directory, content, username = "root", fs) {
		try {
			const obj = getDirInfo(directory)

			if (fs[obj.location] == undefined) {
				throw new Error(`Parent directory ${obj.location} does not exist.`)
			}

			if (fs[obj.location].children[obj.filename] !== undefined) {

				this.permissionsCheck(directory, username, "write", true, fs)

				const file = this.rawFile(directory, fs)
				file.contents = content

				this.markFilesystemChange("file_" + directory, fs)

				return {
					result: true
				}
			}

			const file = templates.file(obj.ext, content)
			fs[obj.location].children[obj.filename] = file

			this.markFilesystemChange("file_" + directory, fs)
			this.markFilesystemChange("directory_" + obj.location, fs)

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

	writeFolder(directory, usr = "root", fs) {
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

		this.permissionsCheck(directory, username, "write", true, fs)

		try {
			const link = templates.link(obj.dir)
			const dir = templates.directory()

			fs[obj.dir] = dir
			fs[obj.location].children[obj.filename] = link

			this.markFilesystemChange("directory_" + directory, fs)
			this.markFilesystemChange("directory_" + obj.location, fs)

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




	deleteFile(directory, username = "root", fs) {
		const obj = getDirInfo(directory)

		try {
			if (fs[obj.location].children[obj.filename] == undefined) {
				return undefined
			}
		} catch (e) {
			return undefined
		}

		this.permissionsCheck(directory, username, "write", true, fs)

		try {
			delete fs[obj.location].children[obj.filename]

			this.markFilesystemChange("file_" + directory, fs)
			this.markFilesystemChange("directory_" + obj.location, fs)

			return fs[obj.location].children[obj.filename] == undefined
		} catch (e) {
			return {
				result: false,
				error: e
			}
		}
	}

	deleteFolder(directory, username = "root", fs) {

		if (fs[directory] == undefined) {
			throw new Error(`Directory ${directory} does not exist.`)
		}

		this.permissionsCheck(directory, username, "write", true, fs)

		try {
			const obj = getDirInfo(directory)

			const list = this.listFolder(directory, username, fs)

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

			this.markFilesystemChange("file_" + directory, fs)
			this.markFilesystemChange("directory_" + obj.location, fs)

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




	readFile(directory, attribute = "contents", username = "root", fs) {

		const obj = getDirInfo(directory)

		try {
			if (fs[obj.location].children[obj.filename] == undefined) {
				return undefined
			}
		} catch (e) {
			return undefined
		}

		if (attribute !== "permissions") {
			this.permissionsCheck(directory, username, "read", true, fs)
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

	listFolder(directory, username = "root", fs) {
		if (fs == undefined) {
			console.debug(fs)
			throw new Error("SYSERROR: VFS DOES NOT EXIST [UNDEFINED]")
		}
		if (fs[directory] == undefined) {
			console.debug(fs)
			throw new Error(`Directory '${directory}' does not exist.`)
		}


		this.permissionsCheck(directory, username, "read", true, fs)

		try {
			return Object.keys(this.rawFolder(directory, username, fs).children)
		} catch (e) {
			return {
				result: false,
				error: e
			}
		}
	}

	rawFile(directory, fs) {
		const obj = getDirInfo(directory)
		return fs[obj.location].children[obj.filename]
	}

	rawFolder(directory, username, fs) {

		this.permissionsCheck(directory, username, "read", true, fs)

		return fs[directory]
	}




	folderPermissions(directory, username = "root", fs) {
		try {
			if (directory == "/") {
				return this.rawFolder("/", username, fs).permissions
			}

			let perms = this.rawFolder(directory, username, fs).permissions
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




	exists(directory, fs) {

		if (directory == "/") {
			return true
		}

		const obj = getDirInfo(directory)

		try {
			return fs[obj.location].children[obj.name] !== undefined
		} catch (e) {
			return false
		}
	}

	isFolder(directory, fs) {
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
}

system.fsErrors = []
system.fs = {}

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

		return obj
	} catch (e) {
		throw {
			error: e,
			directory: dirOld
		}
	}
}

return new fsDriver()