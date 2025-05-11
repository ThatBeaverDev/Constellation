system.handleDisplay = () => {
    const dispDev = system.devices.display;

    if (dispDev.owner == PID) {
        // kernel owns the display and needs to use it

        const maxLogs = (window.innerHeight - 50) / (16 * 1.2)

        if ((system.oldLogs || []).length !== system.logs.length || system.oldDisplayWidth !== window.innerWidth || system.oldDisplayHeight !== window.innerHeight) {
            system.oldLogs = structuredClone(system.logs)
            system.oldDisplayWidth = window.innerWidth
            system.oldDisplayHeight = window.innerHeight

            const logs = system.logs;

            let html = "<p>";
            for (const i in logs) {

                if (i < logs.length - maxLogs) {
                    continue;
                }

                const log = logs[i];

                html += log.content + "<br>"
            }
            html += "</p>"

            html += `<input id="input" type="text">`

            if (system.display.innerHTML !== html) {
                system.display.innerHTML = html
            }

            const input = document.getElementById("input");

            input.style.width = "100%";
            input.style.height = "50px";
            input.style.background = "transparent";
            input.style.border = "None";
            input.style.outline = "None";
            input.style.color = "White";
            input.style.textAlign = "top";

            input.focus()

            input.addEventListener("keyup", async function (event) {
                const key = String(event.key)

                switch (key) {
                    case "Enter":
                        const userInput = input.value.split(" ");
                        input.value = "";

                        const bindir = structuredClone(userInput[0])
                        userInput.splice(0, 1)
                        const args = structuredClone(userInput)

                        const out = await system.startProcess(0, bindir, args, true, "", "root")

                        system.log(bindir, out.stdout)

                }
            })
            dispDev.ropes.focusElem("displayInput");
        }
    }
}