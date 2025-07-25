export default class sidebar {
	parent: any;

	constructor(parent: any) {
		this.parent = parent;
	}

	render() {
		const r = this.parent.renderer;

		r.textbox(
			0,
			0,
			100,
			20,
			"Search Settings...",
			{
				update: (/*key, oldContent*/) => {
					// TODO: search settings
				}
			},
			{ fontSize: 10 }
		);

		r.verticalLine(105, 0, r.windowHeight);
	}
}
