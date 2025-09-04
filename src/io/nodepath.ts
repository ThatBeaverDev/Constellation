// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

"use strict";

const util = {
	isString: (value: any) => typeof value == "string",
	isObject: (value: any) => typeof value == "object"
};

// resolves . and .. elements in a path array with directory names there
// must be no slashes or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
export function normalizeArray(parts: string[], allowAboveRoot: boolean) {
	var res = [];
	for (var i = 0; i < parts.length; i++) {
		var p = parts[i];

		// ignore empty parts
		if (!p || p === ".") continue;

		if (p === "..") {
			if (res.length && res[res.length - 1] !== "..") {
				res.pop();
			} else if (allowAboveRoot) {
				res.push("..");
			}
		} else {
			res.push(p);
		}
	}

	return res;
}

// returns an array with empty elements removed from either end of the input
// array or the original array if no elements need to be removed
function trimArray(arr: string[]) {
	var lastIndex = arr.length - 1;
	var start = 0;
	for (; start <= lastIndex; start++) {
		if (arr[start]) break;
	}

	var end = lastIndex;
	for (; end >= 0; end--) {
		if (arr[end]) break;
	}

	if (start === 0 && end === lastIndex) return arr;
	if (start > end) return [];
	return arr.slice(start, end + 1);
}

// Regex to split a windows path into three parts: [*, device, slash,
// tail] windows-only
var splitDeviceRe =
	/^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;

// Regex to split the tail part of the above into [*, dir, basename, ext]
var splitTailRe =
	/^([\s\S]*?)((?:\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))(?:[\\\/]*)$/;

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
	/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var posix: any = {};

function posixSplitPath(filename: string) {
	const executed = splitPathRe.exec(filename);
	if (executed == null) return;

	return executed.slice(1);
}

// path.resolve([from ...], to)
// posix version
export function resolve(...args: string[]) {
	var resolvedPath = "",
		resolvedAbsolute = false;

	for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
		var path = i >= 0 ? args[i] : "/";

		// Skip empty and invalid entries
		if (!util.isString(path)) {
			throw new TypeError("Arguments to path.resolve must be strings");
		} else if (!path) {
			continue;
		}

		resolvedPath = path + "/" + resolvedPath;
		resolvedAbsolute = path[0] === "/";
	}

	// At this point the path should be resolved to a full absolute path, but
	// handle relative paths to be safe (might happen when process.cwd() fails)

	// Normalize the path
	resolvedPath = normalizeArray(
		resolvedPath.split("/"),
		!resolvedAbsolute
	).join("/");

	return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
}

posix.resolve = resolve;

// path.normalize(path)
// posix version
export function normalize(path: string) {
	var isAbsolute = posix.isAbsolute(path),
		trailingSlash = path && path[path.length - 1] === "/";

	// Normalize the path
	path = normalizeArray(path.split("/"), !isAbsolute).join("/");

	if (!path && !isAbsolute) {
		path = ".";
	}
	if (path && trailingSlash) {
		path += "/";
	}

	return (isAbsolute ? "/" : "") + path;
}
posix.normalize = normalize;

// posix version
export function isAbsolute(path: string) {
	return path.charAt(0) === "/";
}
posix.isAbsolute = isAbsolute;

// posix version
export function join(...args: string[]) {
	var path = "";
	for (var i = 0; i < args.length; i++) {
		var segment = args[i];
		if (!util.isString(segment)) {
			throw new TypeError("Arguments to path.join must be strings");
		}
		if (segment) {
			if (!path) {
				path += segment;
			} else {
				path += "/" + segment;
			}
		}
	}
	return posix.normalize(path);
}
posix.join = join;

// path.relative(from, to)
// posix version
export function relative(from: string, to: string) {
	from = posix.resolve(from).substring(1);
	to = posix.resolve(to).substring(1);

	var fromParts = trimArray(from.split("/"));
	var toParts = trimArray(to.split("/"));

	var length = Math.min(fromParts.length, toParts.length);
	var samePartsLength = length;
	for (var i = 0; i < length; i++) {
		if (fromParts[i] !== toParts[i]) {
			samePartsLength = i;
			break;
		}
	}

	var outputParts = [];
	for (var i = samePartsLength; i < fromParts.length; i++) {
		outputParts.push("..");
	}

	outputParts = outputParts.concat(toParts.slice(samePartsLength));

	return outputParts.join("/");
}
posix.relative = relative;

posix._makeLong = function (path: string) {
	return path;
};

posix.dirname = function (path: string) {
	var result = posixSplitPath(path);

	if (result == undefined) return;

	var root = result[0],
		dir = result[1];

	if (!root && !dir) {
		// No dirname whatsoever
		return ".";
	}

	if (dir) {
		// It has a dirname, strip trailing slash
		dir = dir.substring(0, dir.length - 1);
	}

	return root + dir;
};

posix.basename = function (path: string, ext: string) {
	var f = posixSplitPath(path)?.[2];

	if (f == undefined) return;

	// TODO: make this comparison case-insensitive on windows?
	if (ext && f.substring(-1 * ext.length) === ext) {
		f = f.substring(0, f.length - ext.length);
	}
	return f;
};

posix.extname = function (path: string): string | undefined {
	const split = posixSplitPath(path);

	return split?.[3];
};

posix.format = function (pathObject: {
	dir?: string;
	root?: string;
	base?: string;
	name?: string;
	ext?: string;
}) {
	var root = pathObject.root || "";
	var dir = pathObject.dir ? pathObject.dir + posix.sep : "";
	var base = pathObject.base || "";
	return dir + base;
};

posix.parse = function (path: string) {
	if (!util.isString(path)) {
		throw new TypeError(
			"Parameter 'pathString' must be a string, not " + typeof path
		);
	}
	var allParts = posixSplitPath(path);
	if (!allParts || allParts.length !== 4) {
		throw new TypeError("Invalid path '" + path + "'");
	}
	allParts[1] = allParts[1] || "";
	allParts[2] = allParts[2] || "";
	allParts[3] = allParts[3] || "";

	return {
		root: allParts[0],
		dir: allParts[0] + allParts[1].slice(0, -1),
		base: allParts[2],
		ext: allParts[3],
		name: allParts[2].slice(0, allParts[2].length - allParts[3].length)
	};
};

posix.sep = "/";
posix.delimiter = ":";

export default posix;
