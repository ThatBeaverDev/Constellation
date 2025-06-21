export default class finder extends Application {
	textWidth(text) {
		return this.renderer.getTextWidth(text, 15, "monospace");
	}

	writeText(text) {
		this.renderer.text(this.x, 3, text);

		// padding
		this.x += this.textWidth(text);
		this.x += this.padding;
	}

	drawIcon(name) {
		this.renderer.icon(this.x, 0, name);

		// padding
		this.x += 24;
		this.x += this.padding;
	}

	drawButton(text, callback) {
		this.renderer.button(this.x, 3, text, callback);

		// padding
		this.x += this.textWidth(text);
		this.x += this.padding;
	}

	async init() {
		this.padding = 1;

		await this.cd("/");

		this.renderer.window.rename("Finder");

		this.keyLocations = {
			Constellation: "/",
			System: "/System",
			Users: "/Users"
		};
	}

	keydown(key, cmd, opt, ctrl) {
		if (opt) {
			switch (key) {
				case "KeyG":
					// select directory prompt
					this.cd(prompt("Select a directory"));
					break;
			}
			return;
		}

		// simple keypresse
		switch (key) {
			case "ArrowUp":
				break;
		}
	}

	async directoryIcon(directory) {
		const stats = await this.os.fs.stat(directory);
		const isDir = await stats.isDirectory();

		if (isDir) {
			return "folder";
		}

		if (directory.split(".").length == 1) {
			// no file extension
			return "file";
		}

		const extension = directory.textAfterAll(".");

		switch (extension) {
			case "asm":
			case "s":
			case "S":
			case "inc":
			case "wla":
			case "SRC":
			// assembly
			case "c":
			case "h":
			// C
			case "C":
			case "cc":
			case "cpp":
			case "cxx":
			case "c++":
			case "H":
			case "hh":
			case "hpp":
			case "hxx":
			case "h++":
			case "cppm":
			case "ixx":
			// C++
			case "cs":
			case "csx":
			// C#
			case "dart":
			// dart
			case "java":
			case "class":
			case "jar":
			case "jmod":
			case "war":
			// java
			case "php":
			case "phar":
			case "phtml":
			case "pht":
			case "phps":
			// PHP
			case "ps1":
			case "ps1xml":
			case "pc1c":
			case "pds1":
			case "pdm1":
			case "pssc":
			case "psrc":
			case "cdxml":
			// powershell
			case "rb":
			case "ru":
			// ruby
			case "rs":
			case "rlib":
			// rust
			case "go":
			// go
			case "zig":
			case "zir":
			case "zigr":
			case "zon":
			// zig
			case "py":
			case "pyw":
			case "pyz":
			case "pyi":
			case "pyc":
			case "pyd":
			// python
			case "bat":
			case "cmd":
			case "btm":
			// windows command prompt
			case "js":
			case "mjs":
			case "cjs":
			case "jsx":
			// javascript
			case "ts":
			case "tsx":
			case "mts":
			case "cts":
			// typescript
			case "sh":
			// shell
			case "lua":
			// lua
			case "kt":
			case "kts":
			case "kexe":
			case "klib":
				// kotlin
				return "file-code";
			case "app":
			// macOS App
			case "exe":
			// windows executable
			case "ipa":
			// iOS / iPadOS App
			case "apk":
				// Android App
				return "book-x";
			case "deb":
			// debian packaging format
			case "idx":
			// constellation builtin package format
			case "zip":
			case "gz":
			case "tar":
			case "tar.gz":
				return "package";
			case "png":
			case "ico":
			case "jpg":
			case "jpeg":
			case "webp":
			case "heic:":
			case "icns":
			case "svg":
			case "avif":
				return "file-image";
			case "json":
				return "file-json";
			case "mp3":
			case "ogg":
			case "m4a":
			case "flac":
				return "file-audio";
			case "mp4":
			case "mov":
			case "webm":
				return "file-video";
			default:
				return "file";
		}
	}

	async cd(directory) {
		const oldDir = String(this.directory);

		this.directory = directory;
		const dir = this.directory;
		if (this.directory == "/") {
			this.location = "Constellation";
		} else {
			this.location = "Constellation" + String(this.directory).replaceAll("/", " > ");
		}

		this.listing = await this.os.fs.readdir(dir);

		if (this.listing == undefined) {
			this.directory = oldDir;
			return;
		}

		this.listing = ["..", ...this.listing].map((name) => {
			const obj = {};
			obj.name = name;
			obj.path = this.os.fs.relative(this.directory, name);
			obj.icon = this.directoryIcon(obj.path);

			return obj;
		});
	}

	async frame() {
		this.renderer.clear();

		if (this.listing == undefined) {
			return;
		}

		this.renderer.text(0, 10, "Locations");
		let y = 30;
		let maxWidth = 0;
		for (const name in this.keyLocations) {
			const textWidth = this.textWidth(name);
			if (textWidth > maxWidth) {
				maxWidth = textWidth;
			}

			this.renderer.button(0, y, name);
			y += 20;
		}

		const bottom = this.renderer.window.dimensions.height;
		const right = this.renderer.window.dimensions.width;

		this.renderer.verticalLine(maxWidth + 10, 0, bottom);
		this.renderer.horizontalLine(maxWidth + 10, bottom - 50, right);
		this.renderer.text(maxWidth + 15, bottom - 45, this.location);

		y = 10;
		for (const obj of this.listing) {
			this.renderer.icon(maxWidth + 20, y, await obj.icon);
			this.renderer.button(
				maxWidth + 50,
				y,
				obj.name,
				async () => {
					// right click
					await this.cd(obj.path);
				},
				async () => {
					// left click
				}
			);

			y += 25;
		}

		this.renderer.commit();
	}
}
