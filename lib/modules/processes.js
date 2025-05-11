async function compileSourceCode(directory, src) {
    const shebang = src.split("\n")[0]
    if (shebang.substring(0, 2) !== "#!") {
        //throw new Error(`File [${directory}] has no defined language and therefore no compiler attached.`)

        // assume it's javascript i guess
        return src
    }

    const compilerdir = "/" + shebang.textAfter("/")

    const lines = src.split("\n")
    lines.splice(0, 1)
    const noShebang = lines.join("\n")

    let compiler
    switch(compilerdir) {
        case "/usr/bin/node":
        case "/kernel/js":
        case "/usr/bin/js":
            compiler = (code) => {
                return code
            }
            break;
        default:
            compiler = async (code) => {
                return await system.startProcess(0, compilerdir, [code], null, "root", false, {type: "c"})
            }

    }

    return compiler(noShebang)
}

system.compileSourceCode = compileSourceCode


system.kernelProcessCount = 0
class Process {
    constructor(parent, reference, args = [], stdin = null, user = "root", procType = "u", useSharedMemory = false) {
        this.name = reference
        this.parent = parent;
        this.args = args;
        this.stdio = {
            in: stdin,
            out: ""
        };
        this.user = user;

        this.type = procType;

        // PID assignment
        system.maxPID++;
        this.PID = Number(system.maxPID);

        this.children = [];

        system.processes[parent].children.push(this.PID)

        this.setup = false

        this.asyncSetup(parent, reference, args, stdin, user, procType, useSharedMemory)
    };

    async asyncSetup(parent, reference, args, stdin, user, procType, useSharedMemory) {
                // get code for process to run
                let code
                switch (this.type) {
                    case "c":
                    case "u":
                        const directory = reference
                        this.cwd = String(directory).textBeforeLast("/")
        
                        const file = system.fs.readFile(directory)        
                        if (file == undefined) {
                            throw new Error("File " + reference + " is empty and cannot be ran as a process.")
                        }
        
                        code = await compileSourceCode(directory, file)
                        break;
                    case "k":
                        this.name = 'k' + system.kernelProcessCount
                        this.cwd = "/"
                        system.kernelProcessCount++
                        code = reference
                        break;
                    default:
                        throw new Error("Unknown process type: " + this.type)
                }
        
                if (user == "root") {
                    if (procType == "u") {
                        this.type = "k"
                    }
                }
        
                let after = `\n\n\n
                let SYS_INIT_EXPORT;
                let SYS_FRAME_EXPORT;
                let SYS_COMPILER_EXPORT;
                let SYS_TERMINATE_EXPORT;
                try { SYS_INIT_EXPORT = init; } catch {};
                try { SYS_FRAME_EXPORT = frame; } catch {};
                try { SYS_COMPILER_EXPORT = compile; } catch {};
                try { SYS_TERMINATE_EXPORT = terminate; } catch {};
        
                return {
                    init: SYS_INIT_EXPORT,
                    frame: SYS_FRAME_EXPORT,
                    compile: SYS_COMPILER_EXPORT,
                    terminate: SYS_TERMINATE_EXPORT
                };`
        
                this.src = code + after;
        
                this.memory = {};
        
                const func = new Function("local", "parent", "std", "Name", "PID", "args", "call", "console", "system", this.src);
        
                let pcsSystem;
                if (this.type == "k") pcsSystem = system;
        
                const calls = {}
                for (const i in system.syscalls) {
                    calls[i] = async (...args) => {
                        system.runningPID = this.PID;
                        return system.syscalls[i](...args);
                    }
                }
                
                const logging = {
                    log: window.console.log.bind(window.console, `[${Date.now()}] INFO  {${this.name}} - `),
                    debug: window.console.debug.bind(window.console, `[${Date.now()}] DEBUG {${this.name}} - `),
                    warn: window.console.warn.bind(window.console, `[${Date.now()}] WARN  {${this.name}} - `),
                    error: window.console.error.bind(window.console, `[${Date.now()}] ERROR {${this.name}} - `)
                }

                const loggingHandler = {
                    get(target, property, receiver) {
                        if (logging[property] !== undefined) {
                            return logging[property]
                        }

                        return window.console[property]
                    }
                }

                const loggingProxy = new Proxy(logging, loggingHandler)
        
                let inf
                if (useSharedMemory) {
                    inf = system.processes[parent].memory.shared
                } else {
                    inf = {
                        PID: parent
                    }
                }
                const parentData = inf
        
                this.rigging = func(this.memory, parentData, this.stdio, this.name, this.PID, this.args, calls, loggingProxy, pcsSystem);
        
                this.setup = true;
                this.running = false;
    }

    async init() {
        if (this.type == "c") {
            let result = await this.rigging.compile(this.args[0])

            delete this.rigging.init
            delete this.rigging.frame
            delete this.rigging.compile
            delete this.rigging.terminate

            this.terminate()

            return result
        } else {
            if (this.running == true) return;
            this.running = true;
    
            await this.rigging.init(this.args)
    
            this.running = false;
            return this.stdio
        }
    }

    async frame() {
        if (this.running == true) return;
        this.running = true;

        await this.rigging.frame(this.args)

        this.running = false;

        return this.stdio
    }

    async terminate() {

        try {
            await this.rigging.terminate(this.args);
        } catch {}
        const std = structuredClone(this.stdio);

        this.running = false;

        return std
    }
}

system.process = Process

const kprocb64 = "Ly8ga2VybmVsIGNvZGUgLSBzaW1wbHkgc2l0cyBpZGxlIHNvIHByb2Nlc3NlcyBjYW4gYmUgcGFyZW50ZWQgdG8gaXQuCgpmdW5jdGlvbiBpbml0KCkge30KCmZ1bmN0aW9uIGZyYW1lKCkge30="
const kproc = atob(kprocb64)

system.processes = {
    0: {
        children: []
    }
}
const processes = system.processes

system.processes[0] =  new Process(0, kproc, [], null, "root", "k")

await system.processes[0].init()
await system.processes[0].frame()

system.startProcess = async function (parentPID, dir, args = [], stdin = null, usr, useSharedMemory = false, otherOptions = {}) {

    let user = usr
    if (user == undefined) {
        user = system.processes[parentPID].user
    }

    let procType = "u"
    if (otherOptions.type !== undefined) {
        procType = otherOptions.type
    }

    let process
    try {
        process = new Process(parentPID, dir, args, stdin, user, procType, useSharedMemory)
    } catch (e) {
        console.error(dir)
        console.error(e)
        throw e
    }

    await new Promise((resolve) => {
        let interval = setInterval(() => {
            if (process.setup == true) {
                clearInterval(interval)
                resolve()
            }
        })
    })

    system.processes[Number(process.PID)] = process;

    const procdir = "/proc/" + process.PID
    system.fs.writeFolder(procdir)

    system.fs.writeFile(procdir + "/cmdline", String(dir) + " " + args.join(" "))
    system.fs.writeFile(procdir + "/exe", String(dir))
    system.fs.writeFile(procdir + "/args", args)
    system.fs.writeFile(procdir + "/parent", parentPID)
    system.fs.writeFile(procdir + "/user", user)
    system.fs.writeFile(procdir + "/stdin", stdin)
    
    let stdio
    try {

        stdio = await process.init()

    } catch (e) {

        // process error
        try {
            await process.terminate()
        } catch {}

        await system.stopProcess(process.PID)
        throw e
    }

    if (procType == "c") {
        return stdio
    } else {
        return {
            stdout: stdio.out,
            PID: process.PID,
            process: structuredClone(JSON.parse(JSON.stringify(process)))
        }
    }
}










system.stopProcess = async function (PID, terminatingDueToParentKill = false, runTerminateCode = true) {
    system.task = "stopProcess";
    if (Number(PID) < 0) return;

    const obj = processes[Number(PID)];

    if (terminatingDueToParentKill == true) {
        if (obj.children.length !== 0) {
            obj.parent = 1
            return false;
        }
    }

    const oldRunningPID = Number(system.runningPID);
    system.runningPID = Number(obj.PID);

    // run it
    if (runTerminateCode == true) {
        obj.terminate()
    }

    system.runningPID = Number(oldRunningPID);

    for (const i in system.devices) {
        if (system.devices[i].owner == PID) {
            system.log(moduleName, "Process " + PID + " in termination has control of '" + i + "': commandeering to kernel.");
            system.devices[i].owner = 0;
        };
    };

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

    delete processes[Number(PID)];

    const procFiles = system.fs.listFolder("/proc/" + PID)
    for (const i in procFiles) {
        await system.fs.deleteFile("/proc/" + PID + "/" + procFiles[i])
    }

    system.fs.deleteFolder("/proc/" + PID)

    system.task = undefined;
    return true
}










system.runProcesses = () => {
    try {

        system.isLooping = true

        const processes = system.processes

        if (system.devices.display.owner !== 0) {
            system.fcs = system.focus[system.focus.length - 1]
            system.mainFcs = system.fcs
        }

        if (processes == undefined) {
            throw new Error("Processes is empty.")
        }

        for (const i in processes) {
            const obj = processes[i]

            if (i == 0) {
                continue;
            }

            if (obj.rigging.frame == undefined) {
                system.stopProcess(i)
                continue;
            }

            // catch errors so one program can't crash them all
            try {
                system.runningPID = Number(i)

                obj.frame() // run it

            } catch (e) {
                console.error(Name + ": processRunner running " + obj.name, "( parent " + obj.parent + ")", e.stack)
                system.stopProcess(obj.PID) // kill it because it is broken.
            }
        }

        system.runningPID = undefined;
    } catch (e) {
        throw new Error(e)
    }
}