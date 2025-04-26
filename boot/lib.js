window.call = {}
const c = window.call

// filesystem
c.read = (directory, attribute = "contents") => {
    const dir = system.toDir(directory, c.getcwd())
    return system.fs.readFile(dir, attribute)
}
c.write = (directory, content) => {
    try {
        const dir = system.toDir(directory, c.getcwd())
        system.fs.writeFile(dir, content, c.whoami())
    } catch(e) {
        return -1
    }
    return 0
}
//c.rename = (oldDir, newDir) => {

//}
c.unlink = (directory) => {
    const dir = system.toDir(directory, c.getcwd());
    if (system.fs.isFolder(dir)) {
        system.fs.deleteFolder(dir, c.whoami(), c.whoami())
    } else {
        system.fs.deleteFile(dir, c.whoami(), c.whoami())
    }
}
//c.utime = (directory) => {

//}

//c.chmod = (directory) => {

//}
//c.chown = (directory) => {

//}
c.whoami = () => {
    return system.processes[c.getpid()].token.user
}

c.readdir = async function (directory, attribute = "children") {
    switch(attribute) {
        case "children":
            return await system.fs.listFolder(directory, c.whoami())
            break;
        case "permissions":
            const permissions = await system.fs.folderPermissions(directory, c.whoami())
            return structuredClone(permissions)
            break;
        default:
            return await system.fs.rawFolder(directory, c.whoami())[attribute]
    }
}
c.mkdir = async function (directory) {
    try {
        const dir = system.toDir(directory, c.getcwd())
        await system.fs.writeFolder(dir, c.whoami())
    } catch(e) {
        return -1
    }
    return 0
}
c.mount
c.umount

c.chdir = (target) => {
    try {
        const newDir = system.toDir(target, c.getcwd())
        system.processes[c.getpid()].cwd = newDir
    } catch(e) {
        return -1
    }
    return 0
}
c.getcwd = () => String(system.processes[c.getpid()].cwd)

c.exec = async function (directory) {
    let result
    try {
        result = await system.startProcess(c.getpid(), directory, [], false, c.whoami(), false)
    } catch(e) {
        return -1
    }
    return structuredClone(result)
}
c.kill = (PID) => {
    const user = c.whoami()
    if (user !== "root") {
        return -1
    }
    try {
        system.stopProcess(PID, false)
    } catch(e) {
        return -1
    }
    return 0
}
c.getpid = () => Number(system.runningPID)
c.getuid = () => ""

c.chroot = (PID, dir) => {
    console.debug(PID)
    console.debug(dir)
    console.debug(c.whoami())
    const user = c.whoami()
    if (user !== "root") {
        return -1
    }

    try {
        const root = system.toDir(dir, c.getcwd())
        system.processes[PID].token.root = String(root)
    } catch(e) {
        return -1
    }
    return 0
}

c.uname = () => {
    return {
        "sysname": "Constellation",
        "release": "v0.5.0"
    };
};
c.sysinfo = () => {
    return {
        "uptime": (Date.now() - sse.startTime) / 1000,
        "totalRam": performance.memory.jsHeapSizeLimit,
        "freeRam": performance.memory.jsHeapSizeLimit - performance.memory.totalJSHeapSize,
        "usedRam": performance.memory.totalJSHeapSize,
        "procs": Object.keys(system.processes).length
    }
}
c.gethostname = () => String(
    system.fs.readFile("/etc/hostname", "contents", "root")
)
c.sethostname = (hostname) => {
    try {
        system.fs.writeFile("/etc/hostname", hostname)
    } catch(e) {
        return -1
    }
    return 0
}

//c.shutdown = async function () {
//    try {
//        await system.localFS.commit()
//    } catch(e) {
//        return -1
//    }
//    return 0
//}
c.reboot = async function () {
    try {
        await system.localFS.commit()
        location.reload()
    } catch(e) {
        return -1
    }
    return 0
}

const messages = {}
const names = {}

c.getmsgs = () => {

    const msgs = messages[c.getpid()]

    if (msgs == undefined) {
        messages[c.getpid()] = []
        return []
    }

    return structuredClone(msgs)
}
c.deletemsgs = () => {
    try {
        messages[c.getpid()] = [];
    } catch(e) {
        return -1
    }
    return 0
}
c.sendmsg = (targetPID, content) => {

    if (targetPID == undefined) {
        return -1
    }

    if (messages[targetPID] == []) {
        return -1
    }

    messages[targetPID].push({
        origin: nameOfPid(c.getpid()),
        content: content,
        time: Date.now()
    })

    return 0
}

c.shout = (name) => {
    names[name] = c.getpid()
    return 0
}

function nameOfPid(PID) {
    return Object.keys(names)[Object.values(names).indexOf(PID)]
}

function pidOfName(name) {
    return names[name]
}