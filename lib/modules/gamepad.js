window.addEventListener("gamepadconnected", (event) => {
    console.warn(event)
    system.devices.gpad = {
        owner: PID,
        ropes: {
            //get
        }
    }
})

window.addEventListener("gamepaddisconnected", (event) => {
    delete system.devices.gpad
})