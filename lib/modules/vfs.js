function longestStringInArray(arr, dir) {
    let longestLength = 0
    let longestString = undefined

    if (arr.length == 0) {
        console.debug("Array reduce for getVFS appears to be empty? directory: " + dir)
    }

    for (const i in arr) {
        const item = String(arr[i])

        if (item.length > longestLength) {
            longestLength = item.length
            longestString = item
        }

    }
    return longestString
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

        obj.vfs = longestStringInArray(vfs, dirOld)

        obj.vfsInf = system.vfs[obj.vfs].data

        obj.vfsType = system.vfs[obj.vfs].type

        return obj
    } catch (e) {
        throw {
            error: e,
            directory: dirOld
        }
    }
}

const getVFS = (directory) => {
    //try {

    if (directory === undefined) {
        throw new Error("Directory cannot be undefined!")
    }

    const obj = getDirInfo(directory)

    let vfsDir = directory.textAfter(obj.vfs)

    // insure the directory the user is accessing has a '/' on the start (needed to work)
    if (vfsDir[0] !== "/") {
        vfsDir = "/" + vfsDir
    }

    return {
        vfs: obj.vfsInf,
        vfsDir: vfsDir,
        vfsType: obj.vfsType,
        vfsTypeDriver: system.drivers[obj.vfsType]
    }
    //} catch (e) {
    //	console.warn(e)
    //	return {
    //		vfs: undefined,
    //		vfsDir: "/"
    //	}
    //}
}

system.fs.getDirInfo = getDirInfo
system.fs.getVFS = getVFS

system.vfs = {}

system.blankVFS = (type = "cfs") => {
    return system.drivers[type].newFS()
};

system.newVFS = (directory, vfsVar, link = true, filesystem = "cfs") => {

    system.log(Name, `VFS in ${directory} has been created and mounted.`)

    if (link == true) {
        const vfs = getVFS(directory)
        const obj = getDirInfo(vfs.vfsDir)

        const link = system.fs.link(obj.dir)

        vfs.vfs[obj.location].children[obj.filename] = link
    }

    system.vfs[directory] = {
        data: vfsVar,
        type: filesystem   
    };
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