system.setParam = function (name, value) {
    var s = new URLSearchParams(location.search);
    s.set(String(name), String(value));
    history.replaceState("", "", "?" + s.toString());
}

system.getParam = function (name) {
    return new URLSearchParams(location.search).get(String(name))
}