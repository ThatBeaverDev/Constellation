const getDirInfo = system.fs.getDirInfo
const getVFS = system.fs.getVFS

// File operations
system.fs.readFile = (directory, attribute = "contents", username = "root") => {
    const obj = getVFS(directory)
    return obj.vfsTypeDriver.readFile(obj.vfsDir, attribute, username, obj.vfs)
}

system.fs.writeFile = (directory, content, username = "root") => {
    const obj = getVFS(directory)
    return obj.vfsTypeDriver.writeFile(obj.vfsDir, content, username, obj.vfs)
}

system.fs.deleteFile = (directory, username = "root") => {
    const obj = getVFS(directory)
    return obj.vfsTypeDriver.deleteFile(obj.vfsDir, username, obj.vfs)
}


// Folder operations
system.fs.listFolder = (directory, username = "root") => {
    const obj = getVFS(directory)
    return obj.vfsTypeDriver.listFolder(obj.vfsDir, username, obj.vfs)
}

system.fs.writeFolder = (directory, username = "root") => {
    const obj = getVFS(directory)
    return obj.vfsTypeDriver.writeFolder(obj.vfsDir, username, obj.vfs)
}

system.fs.deleteFolder = (directory, username = "root") => {
    const obj = getVFS(directory)
    return obj.vfsTypeDriver.deleteFolder(obj.vfsDir, username, obj.vfs)
}

system.fs.rawFolder = (directory, username = "root") => {
    const obj = getVFS(directory)
    return obj.vfsTypeDriver.rawFolder(obj.vfsDir, username, obj.vfs)
}

system.fs.isFolder = (directory) => {
    const obj = getVFS(directory)
    return obj.vfsTypeDriver.isFolder(obj.vfsDir, obj.vfs)
}

system.fs.folderPermissions = (directory, username = "root") => {
    const obj = getVFS(directory)
    return obj.vfsTypeDriver.folderPermissions(obj.vfsDir, username, obj.vfs)
}


// Typeless operations (files AND folders)
system.fs.exists = (directory) => {
    const obj = getVFS(directory)
    return obj.vfsTypeDriver.exists(obj.vfsDir, obj.vfs)
}

system.newVFS("/", system.memory.kernel.rootFS, false, "cfs")

system.memory.kernel.tempVFS = system.blankVFS()
system.newVFS("/tmp", system.memory.kernel.tempVFS, false, "cfs")

system.memory.kernel.procVFS = system.blankVFS()
system.newVFS("/proc", system.memory.kernel.procVFS, false, "cfs")

system.fsinit = true

for (const i in system.writeFileQueue) {
    const item = system.writeFileQueue[0]

    await system.fs.writeFile(item.directory, item.content, "root")

    system.writeFileQueue.splice(0, 1)
}

system.volumes = system.fsBackend.partitions.volumes

system.localFS = {
    commit: async () => {
        console.debug("Filesystem committed to hostOS [" + navigator.platform + "]")
        if (system.memory.kernel.rootFS.changes.length !== 0) {
            await system.fsBackend.writeVol(initram.volumeGUID, "cfsData.json", system.memory.kernel.rootFS, true)
            system.memory.kernel.rootFS.changes = []
        }
    }
}