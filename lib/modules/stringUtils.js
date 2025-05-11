String.prototype.textAfter = function (after) {
    return this.substring(this.indexOf(after) + String(after).length)
}

String.prototype.textBefore = function (before) {
    return this.substring(0, this.indexOf(before))
}

String.prototype.textAfterAll = function (after) {
    return this.split("").reverse().join("").textBefore(after).split("").reverse().join("")
}

String.prototype.textBeforeLast = function (before) {
    return this.split("").reverse().join("").textAfter(before).split("").reverse().join("")
}

window.objectify = function Objectify(obj) {
    if (typeof obj === "object") {
        return obj;
    }
    try {
        return (JSON.parse(obj))
    } catch (e) { }
    try {
        return (obj)
    } catch (e) { }
}

window.stringify = function Stringify(str, beautify) {
    if (typeof str === "object") {
        if (beautify) {
            return JSON.stringify(str, null, 4);
        } else {
            return JSON.stringify(str);
        }
    }
    return (String(str))
}