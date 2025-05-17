// protostar bootloader
{
    let init = async function biosinit(fsBackend = {}, isReboot = false) {
        const system = {
            display: document.getElementById("display"),
            fsBackend: fsBackend
        };
        document.title = "cBIOS"

        system.display.style.textAlign = "center"
        system.display.style.lineHeight = "1.5"
        system.display.style.fontSize = "16px"
        const newlines = window.innerHeight / 48 // (1.5 line height * 16px font size * 2 (for half the height))
        const text = "\n".repeat(newlines) + "Press ENTER on your computer to select a volume directory."

        let amt = 0
        system.interval = setInterval(() => {
            const pos = amt % 10
            let out
            if (pos < 3) {
                out = text + "\n\n.";
            } else if (pos < 6) {
                out = text + "\n\n..";
            } else {
                out = text + "\n\n...";
            }

            if (system.display.innerText !== out) {
                system.display.innerText = out
            }

            amt++
        }, 250)

        system.reboot = () => {
            const fsBackend = system.fsBackend
            system.fsBackend = ""

            init(fsBackend, true)
            return
        }

        async function writeCptDisk() {
            const backend = system.fsBackend;

            const cPartMappingWritableStream = await backend.cPartMappingHandle.createWritable();

            let toWrite = JSON.stringify(system.fsBackend.partitions, null, 4)

            await cPartMappingWritableStream.write(toWrite);

            await cPartMappingWritableStream.close();
        };

        function newGUID() {
            const guid = Math.floor(Math.random() * 4294967295)
            if (system.fsBackend.partitions[guid] !== undefined) {
                return newGUID()
            }
            return guid
        }

        async function getVolumeWriteHandle(GUID, isNew) {
            const backend = system.fsBackend
            const vol = backend.partitions.volumes[GUID]

            vol.directoryHandle = await backend.fsHandle.getDirectoryHandle("vol_" + GUID, { create: isNew })
        }

        async function initVolume(GUID, isNew) {
            await getVolumeWriteHandle(GUID, isNew)
        }

        async function mkvol(name, type = "data", fsType = "raw", metadata = {}) {
            const volume = {
                name: name,
                guid: newGUID()
            }

            volume.metadata = {
                ...{
                    readonly: false,
                    automount: true,
                    hidden: false,
                    type: type,
                    fsType: fsType
                },
                ...metadata
            }

            system.fsBackend.partitions.volumes[volume.guid] = volume;

            await initVolume(volume.guid, true);

            writeCptDisk();

            return volume.guid;
        };
        system.fsBackend.mkvol = mkvol;

        async function writeVol(GUID, entry, contents, createFile) {

            let data = String(contents)
            if (typeof contents == "object") {
                data = JSON.stringify(contents)
            }

            const backend = system.fsBackend;

            const volume = backend.partitions.volumes[GUID];

            if (volume == undefined) {
                throw new Error("Volume " + GUID + " does not exist.");
            };

            const dirhandle = volume.directoryHandle;

            const handle = await dirhandle.getFileHandle(entry, { create: createFile })

            const stream = await handle.createWritable()

            await stream.write(data, { type: "write" })

            await stream.close()
        };
        system.fsBackend.writeVol = writeVol;

        async function readVol(GUID, entry) {
            const backend = system.fsBackend;

            const volume = backend.partitions.volumes[GUID];

            if (volume == undefined) {
                throw new Error("Volume " + GUID + " does not exist.");
            };

            const dirhandle = volume.directoryHandle;

            const handle = await dirhandle.getFileHandle(entry)

            const file = await handle.getFile()

            return file.text()
        };

        async function uwriteVol(GUID, entry) {
            const backend = system.fsBackend;

            const volume = backend.partitions.volumes[GUID];

            if (volume == undefined) {
                throw new Error("Volume " + GUID + " does not exist.");
            };

            const dirhandle = volume.directoryHandle

            dirhandle.removeEntry(entry, { recursive: true })            
        }





        system.fsBackend.readVol = readVol;

        async function getHDD() {
            const backend = system.fsBackend
            backend.fsHandle = await window.showDirectoryPicker();
            const fsHandle = backend.fsHandle

            const uri = new URL(window.location.href);

            const fastBootParam = uri.searchParams.get("fastBoot")
            const fastboot = fastBootParam == "true"
            if (fastboot == true) {
                const list = backend.fsHandle.keys()

                let go = true
                while (go) {
                    const item = await list.next()

                    if (item.value == undefined) {
                        go = false
                        break;
                    }

                    await backend.fsHandle.removeEntry(item.value, { recursive: true })
                }
            }

            backend.cPartMappingHandle = await fsHandle.getFileHandle("cpt.json", { create: true })
            backend.cPartMappingFile = await backend.cPartMappingHandle.getFile()
            backend.partitions = await backend.cPartMappingFile.text()

            if (backend.partitions == "") {
                // no mappings - new filesystem!
                system.isNew = true;

                backend.partitions = {
                    volumes: {}
                }

                const volguid = await mkvol("boot", "bootloader", "raw")

                const loader = await (await fetch("./quark/quark.js")).text()
                const localCfsDriver = await (await fetch("./lib/modules/fs/localcfs.js")).text()
                const memCfsDriver = await (await fetch("./lib/modules/fs/memcfs.js")).text()

                await writeVol(volguid, "main", loader, true)
                await writeVol(volguid, "localcfs.js", localCfsDriver, true)
                await writeVol(volguid, "memcfs.js", memCfsDriver, true)

                writeCptDisk();
            } else {
                backend.partitions = JSON.parse(backend.partitions)
            }

            for (const i in backend.partitions.volumes) {
                await initVolume(i, false);
            }
        }

        async function selected() {
            const backend = system.fsBackend

            if (isReboot == false) {
                await getHDD()
            }


            for (const i in backend.partitions.volumes) {
                const vol = backend.partitions.volumes[i]

                if (vol.metadata.type !== "bootloader") {
                    continue;
                }

                let data
                try {
                    data = await readVol(i, "main")

                    const loader = new Function("system", "partitionGUID", data)

                    const initldr = loader(system, i)

                    clearInterval(system.interval)
                    delete system.interval

                    console.debug("vol " + i + " is bootable [booting]")

                    system.display.style.textAlign = ""
                    system.display.style.lineHeight = ""
                    system.display.style.fontSize = ""

                    initldr()
                    return
                } catch { }
            }

            console.error("No bootloader found")
        }


        const uri = new URL(window.location.href)
        const dev = uri.searchParams.get("dev")
        if (dev == "true") {
            window.sse = system // security be damned
        }


        if (isReboot) {
            selected()
        } else {
            const onEnter = (event) => {
                if (event.key == "Enter") {
                    document.removeEventListener("keyup", onEnter)
                    selected()
                }
            }
            document.addEventListener("keyup", onEnter)
        }
    }

    init()
}