const fakeKernel: any = {
	security: {
		env: {
			newEnv() {}
		}
	},
	ui: {
		type: "GraphicalInterface",
		windowSystem: {
			newWindow() {
				return { data: {} };
			}
		},
		uiKit: {
			newRenderer() {
				return {};
			}
		}
	}
};

onmessage = async (e: MessageEvent<{ program: string; processes: string }>) => {
	try {
		// args
		const programBlob = e.data.program;
		const processesBlob = e.data.processes;

		const executables: typeof import("../../../runtime/components/executables.js") =
			await import(processesBlob);

		self.GuiApplication = executables.GuiApplication;
		self.CommandLineApplication = executables.CommandLineApplication;
		self.Process = executables.Process;
		self.Service = executables.Service;
		self.Overlay = executables.Overlay;
		self.Module = executables.Module;

		// retrieve app class
		const Executable: typeof Process = (await import(programBlob)).default;

		if (typeof Executable !== "function") {
			postMessage({
				result: false,
				reason: "Default export is not valid."
			});
			return;
		}

		const process = new Executable(fakeKernel, "/", [], "dev", "dev", {
			args: [],
			children: [],
			counter: 0,
			id: 0,
			kernel: fakeKernel,
			user: "",
			directory: "/",
			startTime: 0,
			program: {} as any,
			parent: {} as any
		});

		if (!(process instanceof executables.Framework)) {
			// bad

			postMessage({
				result: false,
				reason: "Not extensive of framework."
			});
			return;
		}

		if (Object.prototype.hasOwnProperty.call(process, "constructor")) {
			// bad

			postMessage({
				result: false,
				reason: "Provides custom contructor."
			});
			return;
		}

		// all good :>
		postMessage({ result: true });
	} catch (e) {
		console.debug("Applicaton verification failed: " + String(e));
		postMessage({ result: false, reason: String(e) });
	}
};
