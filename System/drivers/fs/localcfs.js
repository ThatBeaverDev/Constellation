const defaultFolderPermissions = {
		owner: {
			user: "root",
			read: true,
			write: true,
			execute: true
		},
		group: {
			group: "root",
			read: true,
			write: true,
			execute: false
		},
		others: {
			read: true,
			write: false,
			execute: false
		}
	}


const templates = {
	directory: (user = "root", permissions = structuredClone(defaultFolderPermissions)) => {
		const obj = {
			permissions: permissions,
			children: {}
		}

		return obj
	},

	file: (ext, content, safeMode, fs) => {

		if (ext == undefined) {
			throw new Error("extension and content MUST be defined when creating a file.")
		}

		const byteSize = str => new Blob([str]).size;

		fs.ids++

		const obj = {
			type: `.${ext}`,
			id: fs.ids,
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





class localCFS {
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

	async permissionsCheck(directory, username, permission, rootOverride = true, fs) {
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
			const permissions = await system.fs.folderPermissions(obj.location)
			let key = "others"
			if (permissions.owner.user == username) {
				key = "owner"
			}

			const access = permissions[key][permission]
			if (access !== true) {
				throw new Error(`User ${username} lacks permission for this action ('${permission}' at '${directory})`)
			}
		}
	}




	newFS() {
		return {
			"/": templates.directory(),
			ids: 0
		}
	}
	async readFS(GUID) {
		const vol = await system.fsBackend.readVol(GUID, "cfsData.json")

		const data = JSON.parse(vol)

		return data
	}
	async onUpdate(GUID, fs) {
		const b = system.fsBackend
		await b.writeVol(GUID, "cfsData.json", JSON.stringify(fs), true)

		return

		let dirUpd
		let waiting = []

		for (const i in fs.changes) {
			const dat = fs.changes[i]
			const type = dat.textBefore("_")
			const dir = dat.textAfter("_")

			if (type == "file") {
			} else if (type == "directory") {
				dirUpd = true
				continue;
			} else {
				console.error("Unknown commit type: " + type)
				continue;
			}

			try {

				const file = await this.rawFile(dir, fs)

				waiting.push(
					b.writeVol(GUID, file.id + ".json", JSON.stringify(file), true)
				)

				console.debug(file)

			} catch (e) {
				console.warn(e)
				console.log(dat)
			}
		}

		fs.changes = []

		for (const i in waiting) {
			await waiting[i]
		}

		if (dirUpd == true) {
			await b.writeVol(GUID, "dirTable.json", JSON.stringify({}), true)
		}
	}





	async writeFile(directory, content, username = "root", fs, volGUID) {
		const obj = getDirInfo(directory)

		if (fs[obj.location] == undefined) {
			throw new Error(`Parent directory ${obj.location} does not exist.`)
		}

		await this.permissionsCheck(directory, username, "write", true, fs)
		try {

			if (fs[obj.location].children[obj.filename] !== undefined) {


				const file = await this.rawFile(directory, fs)
				await system.fsBackend.writeVol(volGUID, file.id + ".json", JSON.stringify({
					contents: content
				}), true)

				this.markFilesystemChange("file_" + directory, fs)

				return {
					result: true
				}
			}

			const file = templates.file(obj.ext, content, false, fs)

			fs[obj.location].children[obj.filename] = file

			await system.fsBackend.writeVol(volGUID, file.id + ".json", JSON.stringify({
				contents: content
			}), true)

			this.markFilesystemChange("file_" + directory, fs)
			this.markFilesystemChange("directory_" + obj.location, fs)
		} catch (e) {
			if (String(e).startsWith("TypeError: Cannot read properties of undefined")) {
				return undefined
			}
			system.fsErrors.push({
				origin: "writeFile",
				error: e
			})
			console.warn("writeFile: " + e + " writing " + directory)
			return undefined
		}

		return {
			result: true,
		}
	}

	async writeFolder(directory, usr = "root", fs, volGUID) {
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

		await this.permissionsCheck(directory, username, "write", true, fs)

		try {

			const parentPermissions = await this.folderPermissions(obj.location, "root", fs)

			const permissions = structuredClone(parentPermissions);
			permissions.owner.user = username≠usr

			const link = templates.link(obj.dir)
			const dir = templates.directory(usr, permissions)

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




	async deleteFile(directory, username = "root", fs, volGUID) {
		const obj = getDirInfo(directory)

		try {
			if (fs[obj.location].children[obj.filename] == undefined) {
				return undefined
			}
		} catch (e) {
			return undefined
		}

		await this.permissionsCheck(directory, username, "write", true, fs)

		try {
			const file = await this.rawFile(directory, fs)
			await system.fsBackend.uwriteVol(volGUID, file.id + ".json")
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

	async deleteFolder(directory, username = "root", fs, volGUID) {

		if (fs[directory] == undefined) {
			throw new Error(`Directory ${directory} does not exist.`)
		}

		await this.permissionsCheck(directory, username, "write", true, fs)

		try {
			const obj = getDirInfo(directory)

			const list = await this.listFolder(directory, username, fs)

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




	async readFile(directory, attribute = "contents", username = "root", fs, volGUID) {

		const obj = getDirInfo(directory)

		try {
			if (fs[obj.location].children[obj.filename] == undefined) {
				return undefined
			}
		} catch (e) {
			return undefined
		}

		if (attribute !== "permissions") {
			await this.permissionsCheck(directory, username, "read", true, fs)
		}

		try {
			const file = fs[obj.location].children[obj.filename]

			if (file.id == undefined) {
				return
			}

			if (attribute == "contents") {

				const data = await system.fsBackend.readVol(volGUID, file.id + ".json");

				if (data == undefined) {
					return undefined;
				}

				const parsed = JSON.parse(data);

				return parsed.contents
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

	async listFolder(directory, username = "root", fs, volGUID) {
		if (fs == undefined) {
			console.debug(fs)
			throw new Error("SYSERROR: VFS DOES NOT EXIST [UNDEFINED]")
		}
		if (fs[directory] == undefined) {
			console.debug(fs)
			throw new Error(`Directory '${directory}' does not exist.`)
		}


		await this.permissionsCheck(directory, username, "read", true, fs)

		try {
			return Object.keys((await this.rawFolder(directory, username, fs)).children)
		} catch (e) {
			return {
				result: false,
				error: e
			}
		}
	}

	async rawFile(directory, fs) {
		const obj = getDirInfo(directory)
		return fs[obj.location].children[obj.filename]
	}

	async rawFolder(directory, username, fs) {

		await this.permissionsCheck(directory, username, "read", true, fs)

		return fs[directory]
	}




	async folderPermissions(directory, username = "root", fs, volGUID) {
		try {
			if (directory == "/") {
				return (await this.rawFolder("/", username, fs)).permissions
			}

			let perms = (await this.rawFolder(directory, username, fs)).permissions
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

	async updateFolderPermissions(directory, permissions, username = "root", fs, volGUID) {
		try {
			const folder = await this.rawFolder(directory, username, fs)

			folder.permissions = {...defaultFolderPermissions, ...permissions}
		} catch (e) {
			console.warn(e);

			system.fsErrors.push({
				origin: "updateFolderPermissions",
				error: e,
				args: [
					directory
				]
			})
			return undefined
		}
	}




	async exists(directory, fs) {

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

	async isFolder(directory, fs) {
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

return new localCFS()