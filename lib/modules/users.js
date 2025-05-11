// start user system
system.user = "root"
system.users = system.fs.readFile("/etc/passwd")

system.userPasswordHash = async function (text) {
    const sha512 = await window.cryptography.sha512(text)

    const base64 = btoa(sha512)

    return base64
}

// function to register users
system.registerUser = async function (name, object) {

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
    await system.registerUser('root', {
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