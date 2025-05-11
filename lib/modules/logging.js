system.logsBox = document.getElementById("logsBox");
system.logs = [];

system.refreshLogsPanel = function (text) {
    if (system.logsFocus == undefined) {
        let data = ""

        for (const i in system.logs) {
            let temp = "<p id='" + system.logs[i].type + "'>"
            temp += system.logs[i].content
            temp += "</p>"
            data += temp
        }

        //system.logsBox.innerHTML = data // comment out to remove the logsbox
        return data
    } else {
        if (typeof system.fs.readFile("/proc")[system.logsFocus] !== "object") {
            delete system.logsFocus
            system.refreshLogsPanel()
        }

        if (text == undefined) return
        //system.logsBox.innerHTML = text // also comment out to remove the logsbox
        try {
            system.preInput.innerHTML = ""
        } catch (e) {
            // this is going to error, let's embrace it
        }
        return text
    }
}

system.log = (origin = Name, str) => {
    const obj = {
        type: "log",
        origin: origin,
        content: "[" + String(Date.now()).padStart(7, 0) + "] INFO  {" + origin + "} - " + window.stringify(str)
    }
    system.logs.push(obj)
    console.log("[" + String(Date.now()).padStart(7, 0) + "] INFO  {" + origin + "} -", str)
    system.refreshLogsPanel()
}

system.debug = (origin = Name, str) => {
    const obj = {
        type: "debug",
        origin: origin,
        content: "[" + String(Date.now()).padStart(7, 0) + "] DEBUG {" + origin + "} - " + window.stringify(str)
    }
    system.logs.push(obj)
    console.debug("[" + String(Date.now()).padStart(7, 0) + "] DEBUG {" + origin + "} -", str)
    system.refreshLogsPanel()
}

system.post = (origin, str) => {
    const obj = {
        type: "post",
        origin: origin,
        content: window.stringify(str)
    }
    system.logs.push(obj)
    console.log(str)
    system.refreshLogsPanel()
}

system.warn = (origin = Name, str) => {
    const obj = {
        type: "warn",
        origin: origin,
        content: "[" + String(Date.now()).padStart(7, 0) + "] WARN  {" + origin + "} - " + window.stringify(str)
    }
    system.logs.push(obj)
    console.warn("[" + String(Date.now()).padStart(7, 0) + "] WARN   {" + origin + "} -", str)
    system.refreshLogsPanel()
}
system.error = (origin = Name, str) => {
    const obj = {
        type: "error",
        origin: origin,
        content: "[" + String(Date.now()).padStart(7, 0) + "] ERROR {" + origin + "} - " + window.stringify(str)
    }
    system.logs.push(obj)
    console.error("[" + String(Date.now()).padStart(7, 0) + "] ERROR {" + origin + "} -", str)
    system.refreshLogsPanel()
}

window.log = system.log;
window.post = system.post;
window.warn = system.warn;
window.error = system.error;

log(Name, "This system and codebase is under the " + system.license + ".")