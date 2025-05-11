system.memory.kernel.lib = {}
system.memory.kernel.lib.calls = {}
system.syscalls = system.memory.kernel.lib.calls
const c = system.memory.kernel.lib.calls

// filesystem
c.read = (directory, attribute = "contents") => {
    const dir = system.toDir(directory, c.getcwd())
    return system.fs.readFile(dir, attribute)
}
c.write = (directory, content) => {
    try {
        const dir = system.toDir(directory, c.getcwd())
        system.fs.writeFile(dir, content, c.whoami())
    } catch (e) {
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
    return system.processes[c.getpid()].user
}
c.chusr = async (username, password) => {
    const users = system.fs.readFile("/etc/passwd")
    const userdata = users[username]
    if (userdata == undefined) throw new Error(`User ${username} does not exist.`)

    const passhash = await window.cryptography.sha512(password)

    if (passhash == userdata.password) {
        system.processes.user = username
        return true
    } else {
        throw new Error("Password is incorrect.")
    }
}

c.readdir = async function (directory, attribute = "children") {
    switch (attribute) {
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
    } catch (e) {
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
    } catch (e) {
        return -1
    }
    return 0
}
c.getcwd = () => {
    return String(system.processes[c.getpid()].cwd);
}
c.exists = (location) => {
    return system.fs.exists(location)
}
c.isDir = (location) => {
    return system.fs.isFolder(location)
}

c.exec = async function (directory, args, stdin, sharedMemory) {
    return system.startProcess(c.getpid(), directory, args, stdin, c.whoami(), sharedMemory)
}
c.kill = (PID) => {

    if (PID == ".") {
        system.stopProcess(c.getpid())
        return;
    }

    const user = c.whoami()
    if (user !== "root") {
        return -1
    }
    try {
        system.stopProcess(PID, false)
    } catch (e) {
        return -1
    }
    return 0
}

c.getpid = () => {
    if (system.runningPID == undefined) {
        throw new Error("System calls may not be utilised within timeouts or intervals outside allocated program runtime.")
    }
    return Number(system.runningPID)
}
c.getuid = () => ""

c.chroot = (PID, dir) => {
    const user = c.whoami()
    if (user !== "root") {
        return -1
    }

    try {
        const root = system.toDir(dir, c.getcwd())
        system.processes[PID].token.root = String(root)
    } catch (e) {
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
    } catch (e) {
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
    } catch (e) {
        return -1
    }
    return 0
}

c.fullDirectory = (location, relative) => {
    return system.toDir(location, relative);
};

system.memory.kernel.lib.messages = {};
const messages = system.memory.kernel.lib.messages;

system.memory.kernel.lib.PIDs = {};
const PIDs = system.memory.kernel.lib.PIDs;

c.send = function (target, content) {
    if (messages[target] == undefined) {
        messages[target] = [];
    }

    messages[target].push({
        origin: c.getpid(),
        content: structuredClone(content),
        sent: Date.now()
    });
}
c.readMsgs = function (deleteAfterRead) {

    if (messages[c.getpid()] == undefined) {
        messages[c.getpid()] = [];
    }

    const data = structuredClone(messages[c.getpid()]);

    if (deleteAfterRead == true) {
        messages[c.getpid()] = [];
    }

    return data
}
c.shout = function (name) {
    system.debug(moduleName, `Process ${c.getpid()} has shouted as ${name}`)
    PIDs[c.getpid()] = name;
}
c.pidOfName = function (name) {
    const keys = Object.keys(PIDs);
    const values = Object.values(PIDs);

    const valuesIndex = values.indexOf(name);

    return Number(keys[valuesIndex]);
}

c.claimDevice = (deviceName) => {

    const PID = c.getpid();

    if (system.devices[deviceName] !== undefined) {
        system.devices[deviceName].owner = PID;

        //if (system.devices[deviceName].restartClaimers == true) {
        //    console.log("display claim requires restart")
        //    const startArgs = structuredClone(system.processes[PID].startProcArgs);
        //    if (startArgs[7].devices == undefined) {
        //        startArgs[7].devices = [];
        //    };
        //    startArgs[7].devices.push("display")
        //
        //    system.stopProcess(PID, false, false)
        //
        //    system.startProcess(...startArgs);
        //}

        system.log(moduleName, deviceName + " has been claimed by PID " + PID);
    } else {
        throw new Error("Device " + deviceName + " is not a valid device.");
    };
}

c.releaseDevice = (deviceName) => {

    const PID = c.getpid();
    const dev = system.devices[deviceName];

    if (dev !== undefined) {
        if (dev.owner == PID) {
            dev.owner = 0
            system.log(moduleName, deviceName + " has been released from PID " + PID);
        }
    } else {
        throw new Error("Device " + deviceName + " is not a valid device.");
    };
};

c.deviceRope = async (deviceName, ropeName, args = []) => {
    const PID = c.getpid();
    const dev = system.devices[deviceName]

    if (dev.owner !== PID) {
        throw new Error("You do not own device " + deviceName)
    }

    const log = (Name, content) => system.log(Name, content) // used within the ropes.

    const ropeResult = await dev.ropes[ropeName](...args);

    return ropeResult
}

c.deviceOwner = (deviceName) => {
    return structuredClone(
        system.devices[deviceName].owner
    )
}




c.visible = () => {
    return system.focus.includes(c.getpid())
}