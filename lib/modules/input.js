// INPUT
system.keys = {};
document.addEventListener('keydown', (e) => {
    system.keys[e.key] = true
});

system.modifier = "Control"
if (navigator.platform == "MacIntel") { // can't use navigator.userAgentData.platform
    system.modifier = "Meta"
}
system.modifier = "Alt";

document.addEventListener('keyup', (e) => {
    system.keys[e.key] = false
})