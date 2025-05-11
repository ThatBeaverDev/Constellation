system.kernelPanic = function (e, when) {

	const snappyMessages = [
		"oops",
		"my bad",
		"forgot doing that caused an error",
		":(",
		"ouch",
		"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
		"noooo",
		"uhm.",
		"not my fault!",
		"!%@%^&@^%^#**&!!$&#$**$$$&^^!$*&#$@#@^&$!#%&%#*&###^%%**!@^$!!%&!***$@^^!$!&^*!@%&%#%%%&&##@@%^!*!$%@!%#^&&$$%&!$^!&&!$*^$$%&*$*",
		"at least your computer still works?"
	]

	var max = setTimeout(function () { /* Empty function */ }, 1);

	for (var i = 1; i <= max; i++) {
		window.clearInterval(i);
		window.clearTimeout(i);
		if (window.mozCancelAnimationFrame) window.mozCancelAnimationFrame(i); // Firefox
	}

	const systemPurged = {
		baseURI: system.baseURI,
		devMode: system.developer,
		fsAPI: system.fsAPI,
		maxPID: system.maxPID,
		safe: system.safe,
		softwareVersions: system.versions,
		cryptoSubtle: window.crypto == undefined,
	}

	try {
		systemPurged.processes = Object.keys(system.processes).length
	} catch (e) {
		systemPurged.processes = "Error reading process count."
	}

	try {
		const disk = JSON.stringify(system.fs)

		const byteSize = str => new Blob([str]).size;

		let diskSize = byteSize(disk)

		let unit = 1

		while (diskSize > 1024) {
			unit++
			diskSize /= 1024
		}

		let formatted = String(Math.round(diskSize))
		switch (unit) {
			case 1:
				formatted += " Bytes"
				break;
			case 2:
				formatted += " KiB"
				break;
			case 3:
				formatted += " MiB"
				break;
			case 4:
				formatted += " GiB"
				break;
			case 5:
				formatted += " TiB"
				break;
		}

		systemPurged.fsSize = String(formatted)
	} catch (e) {
		systemPurged.fsSize = "Error reading filesystem size."
	}

	const panic = `Kernel Panic - A Low Level Critical Error has been hit. ${snappyMessages[Math.floor(Math.random() * snappyMessages.length)]}\nTYPE: ${e.name}\nTASK: ${system.task}\nTIME: ${new Date(Date.now())}\nSTACK TRACE:\n${e.stack}`;

	const reportIssue = document.createElement("a")

	reportIssue.href = `https://github.com/ThatBeaverDev/Constellation/issues/new?title=${encodeURIComponent("Automatically Generated Error" + e)
		}&body=${encodeURIComponent(panic + "\n\n" + JSON.stringify(systemPurged, null, 4))
		}`;

	reportIssue.innerText = "Open a bug report"

	document.body.style.margin = "0px 10%"
	document.body.style.fontSize = "20px"
	document.body.style.fontWeight = `"Source Code Pro", serif`
	//document.body.style.textAlign = "center"
	document.body.style.justifyContent = "space-around"
	document.body.style.width = "100vw"
	document.body.innerHTML = `<div id="display">
	<p>${system.asciiName.replaceAll("\n", "<br>")}<br><br><b>${panic.replaceAll("\n", "<br>")}</b>
	<br>${reportIssue.outerHTML}
	</div>
	</p>`

	console.error(panic)
	console.debug("nothing after this is my fault. Kernel is bailing out.")
}