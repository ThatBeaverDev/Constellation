// pre-filesystem
system.drivers = {
    ...initram.drivers, ...{}
}

async function postFilesystem() {

}

let interval = setInterval(() => {
    if (system.fsinit == true) {
        clearInterval(interval)
        postFilesystem()
    }
}, 25)