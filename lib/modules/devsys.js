system.devices = {}

const devs = system.fs.listFolder("/dev");
for (const i in devs) {
    const content = system.fs.readFile("/dev/" + devs[i]);

    if (content.substring(0, 30) == "#! /boot/loader.js:initDevice\n") {
        const dir = "/dev/" + devs[i]
        system.log(Name, "initDevice: " + dir);

        const dev = new system.asyncFunction("system", system.fs.readFile(dir).substring(31));

        const deviceData = await dev(system);

        system.devices[devs[i]] = {
            ropes: deviceData.ropes,
            owner: PID,
            restartClaimers: deviceData.restartClaimers == true
        }

        console.log(deviceData)
    };
};
