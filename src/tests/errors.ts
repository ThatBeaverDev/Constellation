export class TestingError extends Error {
	constructor(message: any) {
		super(message);
		this.name = "TestingError";
	}
}
