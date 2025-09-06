export default class outOfBoxInstaller extends Application {
	screen: keyof outOfBoxInstaller["screens"] = "welcome";

	async init() {
		this.renderer.hideWindowHeader();
		this.renderer.moveWindow(window.innerWidth / 4, window.innerWidth / 4);
		this.renderer.resizeWindow(
			window.innerWidth / 2,
			window.innerHeight / 2
		);

		this.renderer.setIcon("disk");
	}

	frame() {
		this.renderer.clear();

		const screen = this.screens[this.screen];
		screen();

		this.renderer.commit();
	}

	screens = {
		welcome: () => {
			const title = "Welcome to Constellation!";
			const titleFontSize = 45;

			const titleWidth = this.renderer.getTextWidth(title, titleFontSize);
			const titleHeight = titleFontSize * 1.2;

			const titleLeft = (this.renderer.windowWidth - titleWidth) / 2;
			const titleTop = (this.renderer.windowHeight - titleHeight) / 2;

			this.renderer.text(titleLeft, titleTop, title, titleFontSize);

			const buttonSize = 35;
			const buttonScale = buttonSize / 24;

			const buttonLeft = (this.renderer.windowWidth - buttonSize) / 2;
			const buttonTop =
				(this.renderer.windowHeight - buttonSize) / 2 + 100;

			const continueButton = this.renderer.icon(
				buttonLeft,
				buttonTop,
				"step-forward",
				buttonScale
			);

			this.renderer.onClick(continueButton, () => {
				this.screen = "createUser";
			});
		},
		createUser: () => {
			//const title = "Let's make your user account.";
			//const titleFontSize = 25;

			//const subtext =
			"Your user account is what you login to when Constellation starts.";

			//const titleWidth = this.renderer.getTextWidth(title);
			//const titleHeight = titleFontSize * 1.2;

			//const titleLeft = (this.renderer.windowWidth - titleWidth) / 2;
			//const titleTop = (this.renderer.windowHeight - titleHeight) / 2;
		}
	};
}
