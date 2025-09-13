import ConstellationKernel from "../kernel.js";
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

	const popup = new UserPrompt(ConstellationKernel, "Popup");

	const ui = kernel.GraphicalInterface.uiKit.newRenderer(undefined, popup);

	const width = popup.dimensions.width;

	ui.clear();

	// define rules
	const outerPadding = 25;
	const innerPadding = 10;

	// define icon size
	const iconSize = 50;
	const iconScale = iconSize / 24;

	// draw icon
	let y = outerPadding;
	ui.icon(75, y, icon, iconScale);
	y += iconSize + innerPadding;

	// title
	const titleWidth = ui.getTextWidth(config.title);
	const titleHeight = 15 * 1.2;
	const titleLeft = (width - titleWidth) / 2;

	ui.text(titleLeft, y, config.title);
	y += titleHeight + innerPadding;

	// description
	const descWidth = ui.getTextWidth(config.subtext, 11);
	const descHeight = 11 * 1.2;
	const descLeft = (width - descWidth) / 2;

	ui.text(descLeft, y, config.subtext, 11);
	y += descHeight + innerPadding;

	if (type == "statement") {
		return new Promise(
			(resolve: (result: "primary" | "secondary") => void) => {
				// primary button
				const primaryWidth = ui.getTextWidth(config.primary);
				const primaryHeight = 15 * 1.2;
				const primaryLeft = (width - primaryWidth) / 2;

				const primary = ui.button(primaryLeft, y, config.primary);
				ui.onClick(primary, () => {
					popup.remove();
					resolve("primary");
				});
				y += primaryHeight + innerPadding;

				// secondary button
				if (config.secondary) {
					const secondaryWidth = ui.getTextWidth(config.primary);
					const secondaryHeight = 15 * 1.2;
					const secondaryLeft = (width - secondaryWidth) / 2;

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
			ui.textbox(0, y, width, 25, "Prompt", {
				enter: () => {}
			});
			y += 25 + innerPadding;

			// done button
			const doneWidth = ui.getTextWidth("Done");
			const doneHeight = 15 * 1.2;
			const doneLeft = (width - doneWidth) / 2;

			const done = ui.button(doneLeft, y, "Done");
			ui.onClick(done, () => {
				popup.remove();
				resolve(ui.getTextboxContent() || "");
			});
			y += doneHeight + innerPadding;

			ui.commit();
		});
	}
}
