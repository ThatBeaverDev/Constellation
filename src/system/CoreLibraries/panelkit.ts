import { UiKitRenderer } from "../gui/uiKit/uiKit.js";

export default class PanelKit {
	#renderer: UiKitRenderer;

	minorPadding = 5;
	padding = 15;
	sidebarWidth = 150;

	x = this.sidebarWidth + this.padding;
	y = this.padding;
	#lastType: "card" | "item" | "title" | undefined;

	cardScale = 1.5;
	cardSize = 30 * this.cardScale;

	itemScale = 1.5;
	itemSize = 50 * this.itemScale;

	constructor(renderer: UiKitRenderer) {
		this.#renderer = renderer;
	}

	#typeChange(type: "card" | "title" | "item") {
		if (this.#lastType == type) return;

		this.x = this.sidebarWidth + this.padding;
		switch (this.#lastType) {
			case "card":
				break;
			case "title":
				break;
			case "item":
				this.y += this.itemSize + this.padding;
				break;
		}

		this.#lastType = type;
	}

	reset() {
		this.#renderer.furthestScroll = this.y;

		if (this.#renderer.scroll > 0) {
			this.#renderer.scroll = 0;
		}

		this.x = this.sidebarWidth + this.padding;
		this.y = this.padding + this.#renderer.scroll;
		this.#lastType = undefined;
	}

	card = (
		name: string,
		icon: string,
		onClick?: (x: number, y: number) => void,
		onRightClick?: (x: number, y: number) => void,
		feature?: {
			type: "button";
			text: string;
			icon?: string;
			onClick: () => Promise<void> | void;
		}
	) => {
		this.#typeChange("card");

		const cardWidth =
			this.#renderer.windowWidth - this.sidebarWidth - this.padding * 2;

		this.#renderer
			.box(this.x, this.y, cardWidth, this.cardSize, {
				background: "sidebar",
				borderRadius: 10
			})
			.onClick(onClick, onRightClick, {});

		// sizes
		const iconScale = (this.cardSize - this.minorPadding * 2) / 24;
		const iconSize = 24 * iconScale;
		const nameHeight = this.#renderer.getTextHeight(name);

		// icon positions
		const iconLeft = this.x + (this.cardSize - iconSize) / 2;
		const iconTop = this.y + (this.cardSize - iconSize) / 2;

		// name positions
		const nameLeft = iconLeft + (iconSize + this.minorPadding);
		const nameTop = this.y + (this.cardSize - nameHeight) / 2;

		// draw icon
		this.#renderer.icon(iconLeft, iconTop, icon, iconScale).passthrough();

		// draw name
		this.#renderer.text(nameLeft, nameTop, name).passthrough();

		if (feature) {
			const textWidth = this.#renderer.getTextWidth(feature.text);
			const textHeight = this.#renderer.getTextHeight(feature.text);
			const iconWidth =
				feature.icon == undefined
					? 0
					: 24 * this.cardScale + this.minorPadding;
			const buttonWidth = iconWidth + textWidth + 10;

			const buttonLeft = this.x + (cardWidth - (buttonWidth + 5));
			const textTop = this.y + (this.cardSize - textHeight) / 2;

			this.#renderer
				.box(buttonLeft, this.y + 5, buttonWidth, this.cardSize - 10, {
					background: "var(--bg-lighter)",
					borderRadius: 5
				})
				.onClick(feature.onClick);

			if (feature.icon) {
				this.#renderer
					.icon(buttonLeft + 5, this.y + 10, feature.icon)
					.passthrough();

				const textLeft = buttonLeft + iconSize + 5;

				this.#renderer
					.text(textLeft, textTop, feature.text)
					.passthrough();
			} else {
				this.#renderer
					.text(buttonLeft + 5, textTop, feature.text)
					.passthrough();
			}
		}

		this.y += this.cardSize + this.padding;
	};

	title = (text: string) => {
		this.#typeChange("title");

		// draw text
		this.#renderer.text(this.x, this.y, text, 17);

		// calculate height
		const titleHeight = this.#renderer.getTextHeight(text, 15);

		// next line
		this.x = this.sidebarWidth + this.padding;
		this.y += titleHeight + this.padding;
	};

	mediumCard = (
		title: string,
		subtext: string,
		icon: string,
		onClick?: (x: number, y: number) => void,
		onRightClick?: (x: number, y: number) => void,
		feature?: {
			type: "button";
			text: string;
			icon?: string;
			onClick: () => Promise<void> | void;
		}
	) => {
		this.#typeChange("card");
		const doubleMinorPadding = this.minorPadding * 2;
		const tripleMinorPadding = this.minorPadding * 3;

		const cardWidth =
			this.#renderer.windowWidth - this.sidebarWidth - this.padding * 2;

		const name = this.#renderer.insertNewlines(
			title,
			cardWidth - doubleMinorPadding
		);
		const description = this.#renderer.insertNewlines(
			subtext,
			cardWidth - doubleMinorPadding
		);

		const titleHeight = this.#renderer.getTextHeight(name, 18);

		const textTop = this.y + this.minorPadding;

		const descriptionHeight = this.#renderer.getTextHeight(description, 13);
		const descriptionTop = textTop + this.minorPadding + titleHeight;

		const cardHeight = titleHeight + descriptionHeight + tripleMinorPadding;

		const iconScale = (cardHeight - tripleMinorPadding) / 24;
		const iconSize = 24 * iconScale;
		const iconTop = this.y + (cardHeight - iconSize) / 2;

		const textLeft = this.x + iconSize + tripleMinorPadding;

		this.#renderer
			.box(this.x, this.y, cardWidth, cardHeight, {
				background: "sidebar",
				borderRadius: 10
			})
			.onClick(onClick, onRightClick);

		this.#renderer
			.icon(this.x + tripleMinorPadding / 2, iconTop, icon, iconScale)
			.passthrough();

		// title
		this.#renderer.text(textLeft, textTop, name, 18).passthrough();
		// subtext
		this.#renderer
			.text(textLeft, descriptionTop, description, 13)
			.passthrough();

		if (feature) {
			const textWidth = this.#renderer.getTextWidth(feature.text);
			const textHeight = this.#renderer.getTextHeight(feature.text);
			const iconWidth =
				feature.icon == undefined
					? 0
					: 24 * this.cardScale + this.minorPadding;
			const buttonWidth = iconWidth + textWidth + doubleMinorPadding;
			const buttonHeight = cardHeight - doubleMinorPadding;

			const buttonLeft =
				this.x + (cardWidth - (buttonWidth + this.minorPadding));
			const textTop = this.y + (cardHeight - textHeight) / 2;

			this.#renderer
				.box(
					buttonLeft,
					this.y + (cardHeight - buttonHeight) / 2,
					buttonWidth,
					buttonHeight,
					{
						background: "var(--bg-lighter)",
						borderRadius: 5
					}
				)
				.onClick(feature.onClick);

			if (feature.icon) {
				this.#renderer
					.icon(
						buttonLeft + this.minorPadding,
						this.y + doubleMinorPadding,
						feature.icon
					)
					.passthrough();

				const textLeft = buttonLeft + iconSize + this.minorPadding;

				this.#renderer
					.text(textLeft, textTop, feature.text)
					.passthrough();
			} else {
				this.#renderer
					.text(buttonLeft + this.minorPadding, textTop, feature.text)
					.passthrough();
			}
		}

		this.y += cardHeight + this.padding;
	};

	bigCard = (title: string, subtext: string, href?: string) => {
		this.#typeChange("card");
		const tripleMinorPadding = this.minorPadding * 3;

		const cardWidth =
			this.#renderer.windowWidth - this.sidebarWidth - this.padding * 2;

		const name = this.#renderer.insertNewlines(title, cardWidth - 10);
		const description = this.#renderer.insertNewlines(
			subtext,
			cardWidth - 10
		);
		const link = href
			? this.#renderer.insertNewlines(href, cardWidth - 10)
			: undefined;

		const titleHeight = this.#renderer.getTextHeight(name, 18);

		const textTop = this.y + this.minorPadding;

		const descriptionHeight = this.#renderer.getTextHeight(description);
		const descriptionTop = textTop + this.minorPadding + titleHeight;

		const linkHeight = link
			? this.#renderer.getTextHeight(link) + this.minorPadding
			: this.minorPadding;
		const linkTop = descriptionTop + this.minorPadding + descriptionHeight;

		const cardHeight =
			titleHeight + descriptionHeight + linkHeight + tripleMinorPadding;

		this.#renderer.box(this.x, this.y, cardWidth, cardHeight, {
			background: "sidebar",
			borderRadius: 10
		});
		this.#renderer
			.text(this.x + this.minorPadding, textTop, name, 18)
			.passthrough();
		this.#renderer
			.text(this.x + this.minorPadding, descriptionTop, description)
			.passthrough();
		if (link) {
			this.#renderer
				.text(this.x + this.minorPadding, linkTop, link)
				.passthrough();
		}

		this.y += this.cardSize + this.padding;
	};

	item = (
		name: string,
		icon: string,
		onClick?: () => void,
		onRightClick?: () => void
	) => {
		this.#typeChange("item");

		this.#renderer
			.box(this.x, this.y, this.itemSize, this.itemSize, {
				background: "sidebar",
				borderRadius: 4
			})
			.onClick(onClick, onRightClick);

		// sizes
		const iconSize = 24 * this.itemScale;
		const nameWidth = this.#renderer.getTextWidth(name);
		const nameHeight = this.#renderer.getTextHeight(name);

		// icon positions
		const iconLeft = this.x + (this.itemSize - iconSize) / 2;
		const iconTop =
			this.y +
			(this.itemSize - (iconSize + this.minorPadding + nameHeight)) / 2;

		// name positions
		const nameLeft = this.x + (this.itemSize - nameWidth) / 2;
		const nameTop =
			this.y +
			(iconSize + this.minorPadding) +
			(this.itemSize - (iconSize + this.minorPadding + nameHeight)) / 2;

		// draw icon
		this.#renderer.icon(iconLeft, iconTop, icon, 1.5).passthrough();

		// draw name
		this.#renderer.text(nameLeft, nameTop, name).passthrough();

		this.x += this.itemSize + this.padding;

		if (this.x > this.#renderer.windowWidth) {
			this.x = this.sidebarWidth + this.padding;
			this.y += this.itemSize + this.padding;
		}
	};

	sidebar = (
		...steps: (
			| { type: "title"; text: string }
			| { type: "item"; text: string; icon: string; callback: () => void }
		)[]
	) => {
		// draw sidebar
		this.#renderer.box(
			0,
			0,
			this.sidebarWidth,
			this.#renderer.windowHeight + 100,
			{
				background: "sidebar"
			}
		);

		// functions
		let y = 4;
		const button = (text: string, icon: string, callback: () => void) => {
			const textWidth = this.#renderer.getTextWidth(text);
			const totalWidth =
				this.minorPadding +
				24 +
				this.minorPadding +
				textWidth +
				this.minorPadding;

			if (totalWidth > width) {
				width = totalWidth;
			}

			this.#renderer
				.box(0, y, this.sidebarWidth, 25, {
					background: "sidebar"
				})
				.onClick(callback);

			this.#renderer.icon(this.minorPadding, y, icon).passthrough();
			this.#renderer.text(32, y + 3, text).passthrough();

			y += 30;
		};
		const title = (title: string) => {
			this.#renderer.text(4, y, title, 10, "var(--text-muted)");

			y += 20;
		};

		let width = 0;

		// draw the requested items
		steps.forEach((item) => {
			switch (item.type) {
				case "item":
					button(item.text, item.icon, item.callback);
					break;
				case "title":
					title(item.text);
					break;
			}
		});

		this.sidebarWidth = width;
	};

	table = (
		title: string,
		contents: (string | { type: "icon"; icon: string })[][]
	) => {
		this.title(title);

		this.#typeChange("card");

		const widths: Record<string, number> = {};
		const heights: Record<string, number> = {};

		const itemWidth = (
			item: string | { type: "icon"; icon: string }
		): number => {
			if (typeof item == "string") {
				if (item in widths) {
					return widths[item];
				}

				const width = this.#renderer.getTextWidth(item);
				widths[item] = width;

				return width;
			} else {
				switch (item.type) {
					case "icon":
						return 24 * this.itemScale;
					default:
						throw new Error(`Unknown item type: ${item.type}`);
				}
			}
		};

		const itemHeight = (
			item: string | { type: "icon"; icon: string }
		): number => {
			if (typeof item == "string") {
				if (item in heights) {
					return heights[item];
				}

				const width = this.#renderer.getTextHeight(item);
				heights[item] = width;

				return width;
			} else {
				switch (item.type) {
					case "icon":
						return 24 * this.itemScale;
					default:
						throw new Error(`Unknown item type: ${item.type}`);
				}
			}
		};

		const widthOfColumn = (id: number) => {
			let maxWidth = 0;
			for (const row of contents) {
				const item = row[id];
				if (!item) continue;

				const width = itemWidth(item);

				if (width > maxWidth) {
					maxWidth = width;
				}
			}

			return maxWidth;
		};

		const rowWidths = contents.map((_, index) => widthOfColumn(index));

		let rowID = 0;
		for (const row of contents) {
			const cardWidth =
				this.#renderer.windowWidth -
				this.sidebarWidth -
				this.padding * 2;

			let colour = "sidebar";
			if (rowID++ % 2 !== 0) colour = "var(--bg)";

			let borderRadius: number | [number, number, number, number] = 0;
			if (rowID == 1) {
				borderRadius = [10, 10, 0, 0];
			} else if (rowID == contents.length) {
				borderRadius = [0, 0, 10, 10];
			}

			this.#renderer.box(this.x, this.y, cardWidth, this.cardSize, {
				background: colour,
				borderRadius
			});

			let x = this.x + this.minorPadding;
			let i = 0;
			for (const item of row) {
				const height = itemHeight(item);
				const top = this.y + (this.cardSize - height) / 2;

				const rowWidth = rowWidths[i] + this.padding * 2;

				if (typeof item == "string") {
					this.#renderer.text(x, top, item);
				} else {
					switch (item.type) {
						case "icon":
							this.#renderer.icon(
								x +
									(rowWidth -
										this.padding -
										24 * this.itemScale) /
										2,
								top,
								item.icon,
								this.itemScale
							);
							break;

						default:
							throw new Error(`Unknown item type: ${item.type}`);
					}
				}

				x += rowWidth;

				if (rowID == 1) {
					this.#renderer.verticalLine(
						x - this.padding,
						this.y,
						this.cardSize
					);
				}

				i++;
			}

			this.y += this.cardSize;
		}

		this.y += this.padding;
	};

	blankSpace = (height: number) => {
		this.#typeChange("card");

		this.y += height + this.padding;
	};
}
