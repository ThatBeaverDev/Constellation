export default class menubar {
	parent: any;
	renderer: any;

	barHeight: number = 35;

	constructor(parent: any) {
		this.parent = parent;
		this.renderer = parent.renderer;
	}
	render() {
		this.renderer.box(
			0,
			0,
			this.renderer.window.dimensions.width,
			this.barHeight,
			{
				colour: "var(--main-theme-secondary)",
				borderRadius: "0px 0px 10px 10"
			}
		);

		const iconPadding = (this.barHeight - 24) / 2;

		this.renderer.icon(
			iconPadding,
			iconPadding,
			"/System/CoreAssets/Logos/Constellation-White.svg"
		);
	}
}
