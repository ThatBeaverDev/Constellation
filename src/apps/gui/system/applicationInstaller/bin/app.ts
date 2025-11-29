import PanelKit from "panelkit";
import { ConstellationApplicationInstaller } from "../../../../../system/lib/packaging/definitions";

export default class ApplicationInstaller extends GuiApplication {
	panelkit = new PanelKit(this.renderer);
	application!: ConstellationApplicationInstaller;

	targetDirectory?: string;
	page: keyof ApplicationInstaller["pages"] = "welcome";
	pages = {
		welcome: () => {
			this.panelkit.mediumCard(
				`Welcome to the installer for ${this.application.name} (v${this.application.version}).`,
				"Are you sure you wish to install this application?",
				this.application.icon,
				undefined,
				undefined,
				{
					type: "button",
					text: "Install",
					onClick: () => {
						this.page = "selectTargetDirectory";
					}
				}
			);
		},
		selectTargetDirectory: () => {
			this.panelkit.title("Where should this app be installed?");

			this.panelkit.card("/Applications (global)", "globe", () => {
				this.targetDirectory = "/Applications";
				this.page = "processing";
			});
			this.panelkit.card("~/Applications (local)", "user", () => {
				const userinf = this.env.users.userInfo(this.env.user);
				if (!userinf) {
					this.exit();
					return;
				}

				const userApplicationsDirectory = this.env.fs.resolve(
					userinf.directory,
					"Applications"
				);

				this.targetDirectory = userApplicationsDirectory;
				this.page = "processing";
			});
		},
		processing: async () => {
			this.panelkit.card("Installing program...", "circle-ellipsis");

			this.renderer.commit();

			await this.installApplication();

			this.page = "done";
		},
		done: () => {
			this.panelkit.card(
				"Application successfully installed!",
				"check",
				undefined,
				undefined,
				{
					type: "button",
					text: "Close",
					onClick: () => {
						this.exit();
					}
				}
			);
		}
	};

	async installApplication() {
		if (!this.targetDirectory)
			throw new Error("Target directory not provided.");

		await this.env.shell.index();

		/* --------------- Extract IDX from .inst --------------- */

		// create cache
		await this.env.fs.createDirectory(this.env.fs.resolve("./cache"));

		const cachedIndexPath = this.env.fs.resolve(`./cache/idx${Date.now()}`);

		await this.env.fs.writeFile(
			cachedIndexPath,
			JSON.stringify(this.application.index)
		);

		/* --------------- Write to disk --------------- */

		const appdir = this.env.fs.resolve(
			this.targetDirectory,
			`./${this.application.technicalName}.appl`
		);

		await this.env.shell.exec("tcupkg", cachedIndexPath, appdir);

		/* --------------- Inject Uninstaller --------------- */

		// make components directory
		await this.env.fs.createDirectory(
			this.env.fs.resolve(appdir, "./components")
		);

		const uninstallerPath = this.env.fs.resolve(
			appdir,
			"./components/uninstaller.appl"
		);
		await this.env.fs.copy(
			this.env.fs.resolve("./components/uninstaller.appl"),
			uninstallerPath
		);

		/* --------------- Edit manifest --------------- */

		const manifestPath = this.env.fs.resolve(
			uninstallerPath,
			"./config.js"
		);

		const manifest = await this.env.fs.readFile(manifestPath);

		const processedManifest = manifest.replace(
			`export const applicationName = "__APP__";`,
			`export const applicationName = "${this.application.name}";`
		);

		await this.env.fs.writeFile(manifestPath, processedManifest);
	}

	async deleteCache() {
		const rmdir = async (directory: string) => {
			const list = await this.env.fs.listDirectory(directory);

			for (const item of list) {
				const path = this.env.fs.resolve(directory, item);

				const stats = await this.env.fs.stat(path);

				if (stats.isDirectory()) {
					await rmdir(path);
				} else {
					await this.env.fs.deleteFile(path);
				}
			}

			await this.env.fs.deleteDirectory(directory);
		};

		rmdir(this.env.fs.resolve("./cache"));
	}

	async init(args: string[]) {
		this.renderer.windowName = "Application Installer";

		try {
			this.application = JSON.parse(await this.env.fs.readFile(args[0]));
		} catch (e) {
			this.renderer.prompt(
				"Please open a .inst installer file.",
				"",
				"triangle-alert"
			);
			this.exit();
			return;
		}
	}

	async frame() {
		this.renderer.clear();
		this.panelkit.reset();
		this.panelkit.sidebarWidth = 0;

		const pageRenderer = this.pages[this.page];

		await pageRenderer();

		this.renderer.commit();
	}
}
