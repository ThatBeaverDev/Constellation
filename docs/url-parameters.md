# Constellation URL Parameters

### installerTest

Forces the GUI part of the installer to run. has no effect without
`?forceInstall`

### forceInstall

Forces the installer to run

### dev

runs Constellation in devmode with reduced security.

Exposes the live kernel listing and processes list to `window.kernels`
(`ConstellationKernel[]`) and `window.processes` (`ProcessInformation[]`)
respectively.
