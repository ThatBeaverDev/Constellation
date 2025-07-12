const applicationExtensions = ["appl", "backgr"];

async function getAppConfig(directory: string) {
	const appConf = await env.include(env.fs.relative(directory, "config.js"));
	// get the real data
	return appConf?.default;
}

export async function pathIcon(directory: string) {
	const stats = await env.fs.stat(directory);

	if (!stats.ok) {
		return;
	}

	const extension = directory.textAfterAll(".");

	const isDir = await stats.data.isDirectory();

	if (isDir) {
		const name: string = directory.split("/").pop()!;
		switch (name) {
			case ".git":
				return "folder-git-2";
			default: {
				if (applicationExtensions.includes(extension)) {
					// let's try and extract the app's own icon

					try {
						const config = await getAppConfig(directory);
						// get the icon
						const icon = config?.icon;

						if (icon !== undefined) {
							const isDir = [".", "/"].includes(icon[0]);

							if (isDir) {
								const dir = env.fs.relative(directory, icon);
								return dir;
							} else {
								return icon;
							}
						}
					} catch {
						// return a default
						return "app-window-mac";
					}
					// return a default
					return "app-window-mac";
				}

				if (name.endsWith(".backgr")) {
					return "file-terminal";
				}

				return "folder";
			}
		}
	}

	if (directory.split(".").length == 1) {
		// no file extension
		return "file";
	}

	switch (extension) {
		case "py":
		case "pyw":
		case "pyz":
		case "pyi":
		case "pyc":
		case "pyd":
		// python

		case "java":
		case "class":
		case "jar":
		case "jmod":
		case "war":
		// java

		case "js":
		case "mjs":
		case "cjs":
		case "jsx":
		case "sjs":
		// javascript

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

		case "ts":
		case "tsx":
		case "mts":
		case "cts":
		// typescript

		case "php":
		case "phar":
		case "phtml":
		case "pht":
		case "phps":
		// PHP

		case "go":
		// go

		case "c":
		case "h":
		// C

		case "rb":
		case "ru":
		// ruby

		case "cs":
		case "csx":
		// C#

		case "sh":
		// shell

		case "rs":
		case "rlib":
		// rust

		case "scala":
		case "sc":
		// scala

		case "kt":
		case "kts":
		case "kexe":
		case "klib":
		// kotlin

		case "swift":
		case "SWIFT":
		// swift

		case "nix":
		// nix

		case "plx":
		case "pls":
		case "pl":
		case "pm":
		case "xs":
		case "t":
		case "pod":
		case "cgi":
		case "psgi":
		// perl

		case "lua":
		// lua

		case "groovy":
		case "gvy":
		case "gy":
		case "gsh":
		// groovy

		case "dart":
		// dart

		case "m":
		case "mm":
		case "M":
		// Objective-C

		case "hs":
		case "lhs":
		// haskell

		case "el":
		case "elc":
		case "eln":
		// Emacs Lisp

		case "r":
		case "rdata":
		case "rhistory":
		case "rds":
		case "rda":
		// R

		case "vim":
		// vim script

		case "ex":
		case "exs":
		// elixir

		case "ml":
		case "mli":
		// OCaml

		case "erl":
		case "hrl":
		// Erlang

		// DM (couldn't find the file extensions)

		case "ps1":
		case "ps1xml":
		case "pc1c":
		case "pds1":
		case "pdm1":
		case "pssc":
		case "psrc":
		case "cdxml":
		// powershell

		case "clj":
		case "cljs":
		case "cljr":
		case "cljc":
		case "cljd":
		case "edn":
		// Clojure

		// Smallltalk (couldn't find the file extension)

		case "fs":
		case "fsi":
		case "fsx":
		case "fsscript":
		// F#

		case "asm":
		case "s":
		case "S":
		case "inc":
		case "wla":
		case "SRC":
		// assembly

		case "jl":
		// julia

		case "zig":
		case "zir":
		case "zigr":
		case "zon":
		// zig
		case "bat":
		case "cmd":
		case "btm":
			// windows command prompt
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

		case "?Q?":
		case "7z":
		case "ace":
		case "alz":
		case "arc":
		case "arj":
		case "bz2":
		case "cab":
		case "cpt":
		case "sea":
		case "egg":
		case "egt":
		case "ecab":
		case "ezip":
		case "ess":
		case "flipchart":
		case "fun":
		case "gz":
		case "lawrence":
		case "lbr":
		case "lzh":
		case "lz":
		case "lzo":
		case "lzma":
		case "lzx":
		case "mbw":
		case "mcaddon":
		case "bin":
		case "oar":
		case "pak":
		case "par":
		case "par2":
		case "paf":
		case "pea":
		case "pyk":
		case "rar":
		case "rax":
		case "sitx":
		case "tar":
		case "wax":
		case "xz":
		case "z":
		case "zoo":
		case "zip":
		case "idx": // constellation native format
			return "package";

		// # RASTER IMAGES
		case "art":
		case "blp":
		case "bpm":
		case "bti":
		case "c4":
		case "cals":
		case "cd5":
		case "cit":
		case "clip":
		case "cpl":
		case "dds":
		case "dib":
		case "DjVu":
		case "exif":
		case "gif":
		case "gifv":
		case "grf":
		case "icns":
		case "heic":
		case "heif":
		case "ico":
		case "iff":
		case "ilbm":
		case "lbm":
		case "jng":
		case "jpeg":
		case "jpg":
		case "jfif":
		case "jp2":
		case "jps":
		case "jxl":
		case "kra":
		case "max":
		case "miff":
		case "mng":
		case "msp":
		case "nef":
		case "nitf":
		case "otb":
		case "pbm":
		case "pc1":
		case "pc2":
		case "pc3":
		case "pcf":
		case "pfx":
		case "pdd":
		case "pdn":
		case "pgf":
		case "pgm":
		case "pi1": // Degas Pictures
		case "pi2":
		case "pi3":
		case "pict": // Apple Macintoch
		case "pct":
		case "png":
		case "pnj":
		case "pnm":
		case "pns":
		case "ppm":
		case "procreate":
		case "psb":
		case "psd":
		case "psp":
		case "px":
		case "pxm":
		case "pxr":
		case "pxz":
		case "qfx":
		case "rle": // Run length encoding image
		case "sct":
		case "sgi":
		case "rgb":
		case "int":
		case "bw":
		case "tga":
		case "targa":
		case "icb":
		case "vda":
		case "pix":
		case "tiff":
		case "tif":
		case "webp":
		case "xbm": // X-window server bitmap
		case "xcf": // Gimp image
		case "xpm":
		case "zif":
		// # PHOTOGRAPHS
		case "cr2":
		case "dng":
		case "raw":
		// # VECTORS
		case "3dv":
		case "amf":
		case "awf":
		case "ai":
		case "cgm":
		case "cdr":
		case "cmx":
		case "dp":
		case "drawio":
		case "dxf":
		case "e2d":
		case "eps":
		case "gbr":
		case "odf":
		case "renderman":
		case "svg":
		case "3dmlw":
		case "stl":
		case "wrl":
		case "x3d":
		case "sxf":
		case "tgax":
		case "v2d":
		case "vdoc":
		case "vsd":
		case "vsdx":
		case "vnd":
		case "wmf":
		case "emf":
		case "xar":
			return "file-image";

		// # 3D GRAPHICS
		case "3dmf":
		case "3dm":
		case "3mf":
		case "3ds":
		case "abc":
		case "ac":
		case "an8":
		case "aoi":
		case "b3d":
		case "bbmodel":
		case "blend":
		case "block":
		case "bmd3":
		case "bdl4":
		case "brres":
		case "bfres":
		case "c4d":
		case "cal3d":
		case "ccp4":
		case "cfl":
		case "cob":
		case "core3d":
		case "ctm":
		case "dae":
		case "dff":
		case "dn":
		case "dpm":
		case "dts":
		case "fact":
		case "fbx":
		case "g":
		case "glb":
		case "glm":
		case "gltf":
		case "hec":
		case "io":
		case "iob":
		case "jas":
		case "jmesh":
		case "ldr":
		case "lwo":
		case "lws":
		case "lxf":
		case "lxo":
		case "m3d":
		case "ma":
		case "mb":
		case "mpd":
		case "md2":
		case "md3":
		case "md5":
		case "mdx":
		case "mesh":
		case "miobject":
		case "miparticle":
		case "mimodel":
		case "mm3d":
		case "mpo":
		case "mrc":
		case "nif":
		case "nwc":
		case "nwd":
		case "nwf":
		case "obj":
		case "off":
		case "ogex":
		case "ply":
		case "prc":
		case "prt":
		case "pov":
		case "r3d":
		case "rwx":
		case "sia":
		case "sib":
		case "skp":
		case "sldasm":
		case "sldprt":
		case "smd":
		case "u3d":
		case "usd":
		case "usda":
		case "usdc":
		case "usdz":
		case "vrml97":
		case "vue":
		case "vwx":
		case "wings":
		case "w3d":
		case "x":
		case "z3d":
		case "zbmx":
		// # SHORTCUTS
		case "alias":
		case "jnlp":
		case "lnk":
		case "appref-ms":
		case "nal":
		case "url":
		case "webloc":
		case "sym":
		case "desktop":
			return "file-shortcut";

		case "json":
			return "file-json";

		case "mp3":
		case "ogg":
		case "m4a":
		case "flac":
			return "file-music";

		case "mp4":
		case "mov":
		case "webm":
			return "file-video";

		default:
			return "file";
	}
}

export async function pathName(directory: string) {
	const ext = directory.textAfterAll(".");

	if (applicationExtensions.includes(ext)) {
		// app
		const config = await getAppConfig(directory);
		const name = config?.name;

		if (name !== undefined) {
			return name;
		}
	}

	return directory.textBeforeLast(".");
}

export async function pathMime(directory: string) {
	const stats = await env.fs.stat(directory);

	if (!stats.ok) {
		return;
	}

	const isDir = await stats.data.isDirectory();

	if (isDir) {
		throw new Error("Folders cannot have a MIME type.");
	}

	if (directory.split(".").length == 1) {
		// no file extension
		return "application/octet-stream";
	}

	const extension = directory.textAfterAll(".");

	switch (extension) {
		case "png":
			return "image/png";
		case "jpg":
		case "jpeg":
			return "image/jpeg";
		case "js":
		case "mjs":
		case "cjs":
		case "sjs":
			return "text/javascript";
		case "json":
			return "application/json";
	}

	return "text/plain";
}

export async function pathSize(directory: string) {
	const stat = await env.fs.stat(directory);

	const original = Number(stat.data.size) / 8;
	let size = Number(original);
	let unit = 0;

	while (size > 1024) {
		size /= 1024;
		unit++;
	}

	switch (unit) {
		case 0:
			return {
				bytes: original,
				value: size,
				units: "bytes"
			};
		case 1:
			return {
				bytes: original,
				value: size,
				units: "kibibytes"
			};
		case 2:
			return {
				bytes: original,
				value: size,
				units: "mebibytes"
			};
		case 3:
			return {
				bytes: original,
				value: size,
				units: "gibibytes"
			};
		case 4:
			return {
				bytes: original,
				value: size,
				units: "tebibytes"
			};
		case 5:
			return {
				bytes: original,
				value: size,
				units: "pebibytes"
			};
		default:
			return {
				bytes: original,
				value: original,
				units: "bytes"
			};
	}
}
