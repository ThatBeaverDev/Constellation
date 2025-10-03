import ConstellationKernel from "../kernel.js";
import { getTextHeight, getTextWidth } from "./uiKit/components/textUtils.js";
import { UserPrompt } from "./windows/windows.js";

interface StatementConfig {
	title: string;
	subtext: string;
	primary: string;
	secondary?: string;
}

interface QuestionConfig {
	title: string;
	subtext: string;
	defaultValue?: string;
}

export async function showUserPrompt(
	ConstellationKernel: ConstellationKernel,
	icon: string,
	type: "question",
	confirm: QuestionConfig
): Promise<string | never>;

export async function showUserPrompt(
	ConstellationKernel: ConstellationKernel,
	icon: string,
	type: "statement",
	config: StatementConfig
): Promise<"primary" | "secondary" | never>;

/**
 * Displays a prompt to the user, providing a title, description and two options for buttons.
 * @param icon - Icon to display at the top of the popup
 * @param config - Configuration object to define properties of the popup
 * @returns "primary" or "secondary", depending on whether the first or second button is pressed.
 */
export async function showUserPrompt(
	ConstellationKernel: ConstellationKernel,
	icon: string,
	...args:
		| [type: "statement", config: StatementConfig]
		| [type: "question", config: QuestionConfig]
): Promise<"primary" | "secondary" | string | never | undefined> {
	const [type, config] = args;

	const kernel = ConstellationKernel;
	if (kernel.GraphicalInterface == undefined)
		throw new Error("User Prompts require the GraphicalInterface");

	const iconSize = 50;

	/**
	 * Calculates the widest of the title and subtext
	 * @returns The needed width
	 */
	function calculateNeededWidth() {
		const widths: number[] = [
			getTextWidth(config.title, 15),
			getTextWidth(config.subtext, 11)
		];
		return outerPadding + Math.max(...widths) + outerPadding;
	}

	function calculateNeededHeight() {
		let height = outerPadding + outerPadding;

		// icon
		height += iconSize + innerPadding;
		// title
		height += getTextHeight(config.title, 15) + innerPadding;
		// subtext
		height += getTextHeight(config.subtext, 11) + innerPadding;

		// primary button
		if (type == "statement") {
			// primary button
			height += getTextHeight(config.primary) + innerPadding;

			// secondary button
			if (config.secondary) {
				height += getTextHeight(config.secondary) + innerPadding;
			}
		}

		return height;
	}

	// define rules
	const outerPadding = 25;
	const innerPadding = 10;

	// create window
	const popup = new UserPrompt(
		ConstellationKernel,
		"Popup",
		calculateNeededWidth(),
		calculateNeededHeight()
	);

	/**
	 * This window's UiKit instance
	 */
	const ui = kernel.GraphicalInterface.uiKit.newRenderer(undefined, popup);
	ui.clear();

	const windowWidth = popup.dimensions.width;

	// define icon size
	const iconScale = iconSize / 24;
	const iconLeft = (windowWidth - iconSize) / 2;
	let y = outerPadding;

	/**
	 * Draws the icon of the popup
	 */
	function drawIcon() {
		ui.icon(iconLeft, y, icon, iconScale);
		y += iconSize + innerPadding;
	}

	/**
	 * Draws the title of the popup
	 */
	function drawTitle() {
		const titleWidth = getTextWidth(config.title);
		const titleHeight = getTextHeight(config.title);
		const titleLeft = (windowWidth - titleWidth) / 2;

		ui.text(titleLeft, y, config.title);
		y += titleHeight + innerPadding;
	}
	/**
	 * Draws the subtext of the popup
	 */
	function drawSubtext() {
		const desc = config.subtext;
		const descWidth = getTextWidth(desc, 11);
		const descHeight = getTextHeight(desc, 11);
		const descLeft = (windowWidth - descWidth) / 2;

		ui.text(descLeft, y, desc, 11);
		y += descHeight + innerPadding;
	}

	drawIcon();
	drawTitle();
	drawSubtext();

	if (type == "statement") {
		return new Promise(
			(resolve: (result: "primary" | "secondary") => void) => {
				// primary button
				const primaryWidth = getTextWidth(config.primary);
				const primaryHeight = getTextHeight(config.primary);
				const primaryLeft = (windowWidth - primaryWidth) / 2;

				const primary = ui.button(primaryLeft, y, config.primary);
				ui.onClick(primary, () => {
					popup.remove();
					resolve("primary");
				});
				y += primaryHeight + innerPadding;

				// secondary button
				if (config.secondary) {
					const secondaryWidth = getTextWidth(config.secondary);
					const secondaryHeight = getTextWidth(config.secondary);
					const secondaryLeft = (windowWidth - secondaryWidth) / 2;

					const secondary = ui.button(
						secondaryLeft,
						y,
						config.secondary
					);
					y += secondaryHeight + innerPadding;

					ui.onClick(secondary, () => {
						popup.remove();
						resolve("secondary");
					});
				}

				ui.commit();
			}
		);
	} else if (type == "question") {
		return new Promise((resolve: (result: string) => void) => {
			// textbox
			const textbox = ui.textbox(
				outerPadding,
				y,
				windowWidth - outerPadding - outerPadding,
				25,
				"Prompt",
				{
					enter: () => {}
				}
			);
			y += 25 + innerPadding;

			// done button
			const doneWidth = ui.getTextWidth("Done");
			const doneHeight = 15 * 1.2;
			const doneLeft = (windowWidth - doneWidth) / 2;

			const done = ui.button(doneLeft, y, "Done");
			ui.onClick(done, () => {
				popup.remove();
				resolve(ui.getTextboxContent(textbox) || "");
			});
			y += doneHeight + innerPadding;

			ui.commit();
		});
	}
}
