// QUARK bootloader

// the joke here is that quarks are the most fundamental thing in the universe, making up stars and by extension, Constellations.

// provided: system, partitionGUID

const quark = {
    drivers: {}
}
window.quark = quark

async function driver(name) {
    const moduleCode = await system.fsBackend.readVol(partitionGUID, name + ".js")

    const module = new Function("system", moduleCode)

    const out = await module(system)

    quark.drivers[name] = out
}

function exit() {
    var max = setTimeout(function () { /* Empty function */ }, 1);

    for (var i = 1; i <= max; i++) {
        window.clearInterval(i);
        window.clearTimeout(i);
        if (window.mozCancelAnimationFrame) window.mozCancelAnimationFrame(i); // Firefox
    }
}

function analyseVolumes() {
    const backend = system.fsBackend
    const volumes = backend.partitions.volumes

    let bootables = {}

    for (const i in volumes) {
        const vol = volumes[i]

        if (vol.metadata.type == "bootable") {
            bootables[i] = vol.name
        }
    }

    return bootables
}

async function selectionPanel(pretext, options, b) {
    let outputmapping = b
    if (b == undefined) {
        outputmapping = options
    }

    let selected = false
    let selection = 0

    const refreshDisplay = () => {
        let out

        const opt = structuredClone(options)
        for (const i in opt) {
            if (i == selection) {
                opt[i] = "> " + opt[i]
            } else {
                opt[i] = "- " + opt[i]
            }
        }

        out = opt.join("\n")

        out = pretext + out
        if (system.display.innerText !== out) {
            system.display.innerText = out
        }
    }

    let interval = setInterval(refreshDisplay, 100)

    const onKey = (event) => {
        switch (event.key) {
            case "Enter":
                selected = true
                break;
            case "ArrowUp":
                selection--
                if (selection < 0) {
                    selection = 0
                }
                refreshDisplay()
                break;
            case "ArrowDown":
                selection++
                if (selection > options.length - 1) {
                    selection = options.length - 1
                }
                refreshDisplay()
                break;
            default:
                console.debug(event.key)
        }
        if (event.key == "Enter") {
            selected = true
        }
    }

    document.addEventListener("keyup", onKey)

    return new Promise((resolve) => {
        let loop = setInterval(() => {
            if (selected == true) {
                clearInterval(loop)
                clearInterval(interval)
                document.removeEventListener("keyup", onKey)
                resolve(outputmapping[selection])
            }
        })
    })
}

async function recoveryMode() {
    document.title = "Quark Bootloader (Recovery Mode)"
    const ascii = " _____                  _   ______                                   \n|  _  |                | |  | ___ \\                                  \n| | | |_   _  __ _ _ __| | _| |_/ /___  ___ _____   _____ _ __ _   _ \n| | | | | | |/ _` | '__| |/ /    // _ \\/ __/ _ \\ \\ / / _ \\ '__| | | |\n\\ \\/' / |_| | (_| | |  |   <| |\\ \\  __/ (_| (_) \\ V /  __/ |  | |_| |\n \\_/\\_\\\\__,_|\\__,_|_|  |_|\\_\\_| \\_\\___|\\___\\___/ \\_/ \\___|_|   \\__, |\n                                                                __/ |\n                                                               |___/ "
    const welcomeText = "Welcome to Quark Recovery - No Bootable Regions were detected in the specified location."

    const options = [
        "reinstall",
        "exit"
    ]

    let output = await selectionPanel(ascii + "\n\n" + welcomeText + "\n\n", options)

    switch (output) {
        case "reinstall":
            const installerText = await (await fetch("./quark/installer.js")).text()
            const installer = new Function("system", installerText)
            const install = installer(system)

            await install()

            break;
        case "exit":
            system.display.innerHTML = ""
            return
        default:
            console.warn("Unknown selection: " + output)
    }
}

async function init() {
    document.title = "Quark Bootloader"

    system.display.style.textAlign = "center"
    system.display.style.lineHeight = "1.5"
    system.display.style.fontSize = "16px"

    const bootablesOBJ = analyseVolumes()
    const bootables = Object.keys(bootablesOBJ)
    const bootablesNames = Object.values(bootablesOBJ)

    if (bootables.length == 0) {
        // oop, recovery is needed
        await recoveryMode();
    } else {

        const backendList = structuredClone(bootables)
        backendList.push(
            "newsystem"
        )
        const nameList = structuredClone(bootablesNames)
        nameList.push(
            "New System"
        )

        let volume = await selectionPanel("", nameList, backendList);

        console.log(volume + " is target to boot.")

        switch(volume) {
            case "newsystem":
                await recoveryMode();
                return;
        }

        const vol = system.fsBackend.partitions.volumes[volume]

        const cfgLocation = vol.metadata.quarkCfg // get the config directory

        // how to read fs?
        // need drivers silly
        // how to store them?
        // on the volume obviously
        
        // get the driver
        const fsType = vol.metadata.fsType
        await driver(fsType)
        await driver("memcfs")
        await driver("localcfs")
        const d = quark.drivers[fsType]

        // i got the drivers
        // good.
        
        const fs = await d.readFS(volume)
        const cfg = await d.readFile(cfgLocation, "contents", "root", fs, volume)

        const kernelDir = cfg.params.pos + "/" + cfg.cmd
        const kernelsrc = await d.readFile(kernelDir, "contents", "root", fs, volume)

        system.memory = {
            kernel: {
                rootFS: fs
            }
        }

        if (kernelsrc == undefined) {
            throw new Error("no kernel?")
        }

        const initram = {
            drivers: quark.drivers,
            volumeGUID: volume
        }

        system.display.innerText = ""

        const get_kernel = new Function("system", "initram", kernelsrc)
        const kernel = await get_kernel(system, initram)

        system.display.style.textAlign = ""
        system.display.style.lineHeight = ""
        system.display.style.fontSize = ""

        try {
            kernel()
        } catch(e) {
            console.error(e)
            system.reboot()
        }
    }
}

return init