export class AppInitialisationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "AppInitialisationError";
	}
}

export class ImportError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ImportError";
	}
}

export class InstallationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InstallationError";
	}
}

export class UIError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ImportError";
	}
}
