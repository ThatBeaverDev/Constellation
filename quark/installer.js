    async function install() {

    const auroraLocation = new URL("../aurora/pkgs/aurora/src.js", window.location.href)
    const cfsDriverLocation = new URL("./lib/modules/fs/cfs.js", window.location.href)

    console.debug("Installing Constellation[Aurora] from " + auroraLocation)
    const aurora = await (await fetch(auroraLocation)).text()

    console.debug("Obtaining cfsDriver from " + cfsDriverLocation)
    const cfsDriverSrc = await (await fetch(cfsDriverLocation)).text()
    const cfsDriverFnc = new Function("system", cfsDriverSrc)

    system.drivers = {
        fs: {
            cfs: await cfsDriverFnc(system)
        }
    }
    const d = system.drivers.fs.cfs

    const fs = d.newFS()

    async function fetchURL(URL, parse = false) {
        const data = await fetch(URL)
        
        if (parse) {
            return await data.json()
        } else {
            return await data.text()
        }
        
    }

    console.log("Creating Basic Directories...")

    system.baseURI = ".";

    let list = await fetchURL(system.baseURI + "/index.json", true)

    console.warn(list)
    folders = list.folders
    for (const item in folders) {
        await d.writeFolder(folders[item], "root", fs)
    }

    console.log("Writing Default Files...")

    files = list.files
    for (const item in files) {
        if (typeof files[item] == "object") {
            // handle files with other requirements for being written to FS
            obj = await fetchURL(system.baseURI + files[item].dir)

            if (files[item].parse) {
                obj = JSON.parse(obj)
            }

            await d.writeFile(files[item].dir, obj, "root", fs)
        } else {
            obj = await fetchURL(system.baseURI + files[item])
            await d.writeFile(files[item], obj, "root", fs)
        }
    }

    let auroraFiles = list.auroraFiles
    for (const loc in auroraFiles) {
        const targetDir = auroraFiles[loc]
        const uri = new URL("../aurora" + loc, window.location.href)

        const item = await fetchURL(uri)

        await d.writeFile(targetDir, item, "root", fs)

    }

    await d.writeFile("/bin/aurora.js", aurora, "root", fs)

    await d.writeFile("/sysState.json", {
        isNew: true
    }, "root", fs)
    
    const guid = await system.fsBackend.mkvol("Constellation Disk", "bootable", "cfs", {
        quarkCfg: "/boot/quark/quark.json"
    })
    await system.fsBackend.writeVol(guid, "cfsData.json", fs, true)


    system.reboot()
}

return install