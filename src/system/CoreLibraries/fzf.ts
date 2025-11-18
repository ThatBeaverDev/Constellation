/**
 * Code is from the Constellation Repository! (but not written by me)
 * Code is build result of https://github.com/ajitid/fzf-for-js, with the typescript files overlayed ontop for type safety.
 */

/** @license
 * fzf v0.5.2
 * Copyright (c) 2021 Ajit
 * Licensed under BSD 3-Clause
 */
const normalized: Record<number, string> = {
	0x00d8: "O",
	0x00df: "s",
	0x00f8: "o",
	0x0111: "d",
	0x0127: "h",
	0x0131: "i",
	0x0140: "l",
	0x0142: "l",
	0x0167: "t",
	0x017f: "s",
	0x0180: "b",
	0x0181: "B",
	0x0183: "b",
	0x0186: "O",
	0x0188: "c",
	0x0189: "D",
	0x018a: "D",
	0x018c: "d",
	0x018e: "E",
	0x0190: "E",
	0x0192: "f",
	0x0193: "G",
	0x0197: "I",
	0x0199: "k",
	0x019a: "l",
	0x019c: "M",
	0x019d: "N",
	0x019e: "n",
	0x019f: "O",
	0x01a5: "p",
	0x01ab: "t",
	0x01ad: "t",
	0x01ae: "T",
	0x01b2: "V",
	0x01b4: "y",
	0x01b6: "z",
	0x01dd: "e",
	0x01e5: "g",
	0x0220: "N",
	0x0221: "d",
	0x0225: "z",
	0x0234: "l",
	0x0235: "n",
	0x0236: "t",
	0x0237: "j",
	0x023a: "A",
	0x023b: "C",
	0x023c: "c",
	0x023d: "L",
	0x023e: "T",
	0x023f: "s",
	0x0240: "z",
	0x0243: "B",
	0x0244: "U",
	0x0245: "V",
	0x0246: "E",
	0x0247: "e",
	0x0248: "J",
	0x0249: "j",
	0x024a: "Q",
	0x024b: "q",
	0x024c: "R",
	0x024d: "r",
	0x024e: "Y",
	0x024f: "y",
	0x0250: "a",
	0x0251: "a",
	0x0253: "b",
	0x0254: "o",
	0x0255: "c",
	0x0256: "d",
	0x0257: "d",
	0x0258: "e",
	0x025b: "e",
	0x025c: "e",
	0x025d: "e",
	0x025e: "e",
	0x025f: "j",
	0x0260: "g",
	0x0261: "g",
	0x0262: "G",
	0x0265: "h",
	0x0266: "h",
	0x0268: "i",
	0x026a: "I",
	0x026b: "l",
	0x026c: "l",
	0x026d: "l",
	0x026f: "m",
	0x0270: "m",
	0x0271: "m",
	0x0272: "n",
	0x0273: "n",
	0x0274: "N",
	0x0275: "o",
	0x0279: "r",
	0x027a: "r",
	0x027b: "r",
	0x027c: "r",
	0x027d: "r",
	0x027e: "r",
	0x027f: "r",
	0x0280: "R",
	0x0281: "R",
	0x0282: "s",
	0x0287: "t",
	0x0288: "t",
	0x0289: "u",
	0x028b: "v",
	0x028c: "v",
	0x028d: "w",
	0x028e: "y",
	0x028f: "Y",
	0x0290: "z",
	0x0291: "z",
	0x0297: "c",
	0x0299: "B",
	0x029a: "e",
	0x029b: "G",
	0x029c: "H",
	0x029d: "j",
	0x029e: "k",
	0x029f: "L",
	0x02a0: "q",
	0x02ae: "h",
	0x0363: "a",
	0x0364: "e",
	0x0365: "i",
	0x0366: "o",
	0x0367: "u",
	0x0368: "c",
	0x0369: "d",
	0x036a: "h",
	0x036b: "m",
	0x036c: "r",
	0x036d: "t",
	0x036e: "v",
	0x036f: "x",
	0x1d00: "A",
	0x1d03: "B",
	0x1d04: "C",
	0x1d05: "D",
	0x1d07: "E",
	0x1d08: "e",
	0x1d09: "i",
	0x1d0a: "J",
	0x1d0b: "K",
	0x1d0c: "L",
	0x1d0d: "M",
	0x1d0e: "N",
	0x1d0f: "O",
	0x1d10: "O",
	0x1d11: "o",
	0x1d12: "o",
	0x1d13: "o",
	0x1d16: "o",
	0x1d17: "o",
	0x1d18: "P",
	0x1d19: "R",
	0x1d1a: "R",
	0x1d1b: "T",
	0x1d1c: "U",
	0x1d1d: "u",
	0x1d1e: "u",
	0x1d1f: "m",
	0x1d20: "V",
	0x1d21: "W",
	0x1d22: "Z",
	0x1d62: "i",
	0x1d63: "r",
	0x1d64: "u",
	0x1d65: "v",
	0x1e9a: "a",
	0x1e9b: "s",
	0x2071: "i",
	0x2095: "h",
	0x2096: "k",
	0x2097: "l",
	0x2098: "m",
	0x2099: "n",
	0x209a: "p",
	0x209b: "s",
	0x209c: "t",
	0x2184: "c"
};

for (let i = "\u0300".codePointAt(0)!; i <= "\u036F".codePointAt(0)!; ++i) {
	const diacritic = String.fromCodePoint(i);

	for (const asciiChar of "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz") {
		const withDiacritic = (asciiChar + diacritic).normalize();
		const withDiacriticCodePoint = withDiacritic.codePointAt(0)!;
		if (withDiacriticCodePoint > 126) {
			normalized[withDiacriticCodePoint] = asciiChar;
		}
	}
}

const ranges: Record<string, [number, number]> = {
	a: [7844, 7863],
	e: [7870, 7879],
	o: [7888, 7907],
	u: [7912, 7921]
};

for (const lowerChar of Object.keys(ranges)) {
	const upperChar = lowerChar.toUpperCase();

	for (let i = ranges[lowerChar][0]; i <= ranges[lowerChar][1]; ++i) {
		normalized[i] = i % 2 === 0 ? upperChar : lowerChar;
	}
}

function normalizeRune(rune: Rune): Rune {
	if (rune < 0x00c0 || rune > 0x2184) {
		return rune;
	}

	// while a char can be converted to hex using str.charCodeAt().toString(16), it is not needed
	// because in `normalized` map those hex in keys will be converted to decimals.
	// Also we are passing a number instead of a converting a char so the above line doesn't apply (and that
	// we are using codePointAt instead of charCodeAt)
	const normalizedChar = normalized[rune];
	if (normalizedChar !== undefined) return normalizedChar.codePointAt(0)!;

	return rune;
}

// numerics.ts
type Int16 = Int16Array[0];
type Int32 = Int32Array[0];

// for short, int, long naming convention https://docs.oracle.com/javase/tutorial/java/nutsandbolts/datatypes.html
function toShort(number: number): Int16 {
	/*
  // with this implementation, I don't think it does anything
  // as it is returning a number only, not int16
  const int16 = new Int16Array(1);
  int16[0] = number;
  return int16[0];
  */
	return number;
}
function toInt(number: number): Int32 {
	/*
  // with this implementation, I don't think it does anything
  // as it is returning a number only, not int32
  const int32 = new Int32Array(1);
  int32[0] = number;
  return int32[0];
  */
	return number;
}
function maxInt16(num1: number, num2: number) {
	/*
  // with this implementation, I don't think it does anything
  // as it is returning a number only, not int16
  const arr = Int16Array.from([num1, num2]);
  return arr[0] > arr[1] ? arr[0] : arr[1];
  // also converting to int16 just for comparison accumulates
  // overhead if done thousands of times
  */
	return num1 > num2 ? num1 : num2;
}

// runes.ts
type Rune = Int32;

// This fn should give Int32[] not number[] but this is still okay in current
// state as not many times a rune array is intended to be subarray-ed in the
// code.

const strToRunes = (str: string) => str.split("").map((s) => s.codePointAt(0)!);
const runesToStr = (runes: Rune[]) =>
	runes.map((r) => String.fromCodePoint(r)).join("");

// char.ts

// values for `\s` from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Cheatsheet
const whitespaceRunes = new Set(
	" \f\n\r\t\v\u00a0\u1680\u2028\u2029\u202f\u205f\u3000\ufeff"
		.split("")
		.map((v) => v.codePointAt(0)!)
);
for (
	let codePoint = "\u2000".codePointAt(0)!;
	codePoint <= "\u200a".codePointAt(0)!;
	codePoint++
) {
	whitespaceRunes.add(codePoint);
}

const isWhitespace = (rune: Rune) => whitespaceRunes.has(rune);

const whitespacesAtStart = (runes: Rune[]) => {
	let whitespaces = 0;

	for (const rune of runes) {
		if (isWhitespace(rune)) whitespaces++;
		else break;
	}

	return whitespaces;
};

const whitespacesAtEnd = (runes: Rune[]) => {
	let whitespaces = 0;

	for (let i = runes.length - 1; i >= 0; i--) {
		if (isWhitespace(runes[i])) whitespaces++;
		else break;
	}

	return whitespaces;
};

// algo.ts

const DEBUG = false;

const MAX_ASCII = "\u007F".codePointAt(0)!;
const CAPITAL_A_RUNE = "A".codePointAt(0)!;
const CAPITAL_Z_RUNE = "Z".codePointAt(0)!;
const SMALL_A_RUNE = "a".codePointAt(0)!;
const SMALL_Z_RUNE = "z".codePointAt(0)!;
const NUMERAL_ZERO_RUNE = "0".codePointAt(0)!;
const NUMERAL_NINE_RUNE = "9".codePointAt(0)!;

function indexAt(index: number, max: number, forward: boolean) {
	if (forward) {
		return index;
	}

	return max - index - 1;
}

interface Result {
	// TODO from junegunn/fzf - int32 should suffice
	start: number;
	end: number;
	score: number;
}

const SCORE_MATCH = 16,
	SCORE_GAP_START = -3,
	// TODO: you sure it shouldn't be named "extension"??
	SCORE_GAP_EXTENTION = -1,
	BONUS_BOUNDARY = SCORE_MATCH / 2,
	BONUS_NON_WORD = SCORE_MATCH / 2,
	BONUS_CAMEL_123 = BONUS_BOUNDARY + SCORE_GAP_EXTENTION,
	BONUS_CONSECUTIVE = -(SCORE_GAP_START + SCORE_GAP_EXTENTION),
	BONUS_FIRST_CHAR_MULTIPLIER = 2;

enum Char {
	NonWord,
	Lower,
	Upper,
	Letter,
	Number
}

// named posArray in Go code
function createPosSet(withPos: boolean) {
	if (withPos) {
		// TLDR; there is no easy way to do
		// ```
		// pos := make([]int, 0, len)
		// return &pos
		// ```
		// in JS.
		//
		// Golang has len and capacity:
		// see https://tour.golang.org/moretypes/13
		// and https://stackoverflow.com/a/41668362/7683365
		//
		// JS has a way to define capacity (`new Array(capacity)`) but
		// then all elements in the capacity will be `undefined` and a push
		// will result in the push at the end of the capacity rather than
		// from the start of it (which happens in go using `append`).

		return new Set<number>();
	}

	return null;
}

function alloc16(
	offset: number,
	slab: Slab | null,
	size: number
): [number, Int16Array] {
	if (slab !== null && slab.i16.length > offset + size) {
		const subarray = slab.i16.subarray(offset, offset + size);
		return [offset + size, subarray];
	}

	return [offset, new Int16Array(size)];
}

function alloc32(
	offset: number,
	slab: Slab | null,
	size: number
): [number, Int32Array] {
	if (slab !== null && slab.i32.length > offset + size) {
		const subarray = slab.i32.subarray(offset, offset + size);
		return [offset + size, subarray];
	}

	return [offset, new Int32Array(size)];
}

// rune is type int32 in Golang https://blog.golang.org/strings#TOC_5.
// and represents a character. In JavaScript, rune will be
// int32 [Go] == 'a'.codePointAt(0) [JS] == 97 [number]
//
// I'm considering `input` arg as a string not an array of chars,
// this might led to creation of too many strings in string pool resulting in
// huge garbage collection. JS can't parse it in terms of bytes so I might need to use
// char array instead (which will technically be string array)
function charClassOfAscii(rune: Rune): Char {
	if (rune >= SMALL_A_RUNE && rune <= SMALL_Z_RUNE) {
		return Char.Lower;
	} else if (rune >= CAPITAL_A_RUNE && rune <= CAPITAL_Z_RUNE) {
		return Char.Upper;
	} else if (rune >= NUMERAL_ZERO_RUNE && rune <= NUMERAL_NINE_RUNE) {
		return Char.Number;
	} else {
		return Char.NonWord;
	}
}

function charClassOfNonAscii(rune: Rune): Char {
	const char = String.fromCodePoint(rune);

	// checking whether it is a lowercase letter by checking whether converting
	// it into uppercase has any effect on it
	if (char !== char.toUpperCase()) {
		return Char.Lower;
	} else if (char !== char.toLowerCase()) {
		return Char.Upper;
	} else if (char.match(/\p{Number}/gu) !== null) {
		// from https://stackoverflow.com/a/60827177/7683365 and
		// https://stackoverflow.com/questions/14891129/regular-expression-pl-and-pn
		return Char.Number;
	} else if (char.match(/\p{Letter}/gu) !== null) {
		return Char.Letter;
	}

	return Char.NonWord;
}

function charClassOf(rune: Rune): Char {
	if (rune <= MAX_ASCII) {
		return charClassOfAscii(rune);
	}

	return charClassOfNonAscii(rune);
}

function bonusFor(prevClass: Char, currClass: Char): Int16 {
	if (prevClass === Char.NonWord && currClass !== Char.NonWord) {
		// word boundary
		return BONUS_BOUNDARY;
	} else if (
		(prevClass === Char.Lower && currClass === Char.Upper) ||
		(prevClass !== Char.Number && currClass === Char.Number)
	) {
		// camelCase letter123
		return BONUS_CAMEL_123;
	} else if (currClass === Char.NonWord) {
		return BONUS_NON_WORD;
	}

	return 0;
}

function bonusAt(input: Rune[], idx: number): Int16 {
	if (idx === 0) {
		return BONUS_BOUNDARY;
	}

	return bonusFor(charClassOf(input[idx - 1]), charClassOf(input[idx]));
}

type AlgoFn = (
	caseSensitive: boolean,
	normalize: boolean,
	forward: boolean,
	input: Rune[],
	pattern: Rune[],
	withPos: boolean,
	slab: Slab | null
) => [Result, Set<number> | null];

function trySkip(
	input: Rune[],
	caseSensitive: boolean,
	char: Rune,
	from: number
): number {
	let rest = input.slice(from);
	let idx = rest.indexOf(char);
	if (idx === 0) {
		return from;
	}

	if (!caseSensitive && char >= SMALL_A_RUNE && char <= SMALL_Z_RUNE) {
		if (idx > 0) {
			rest = rest.slice(0, idx);
		}

		// convert ascii lower to upper by subtracting 32 (a -> A)
		// and then checking if it is present in str
		const uidx = rest.indexOf(char - 32);
		if (uidx >= 0) {
			idx = uidx;
		}
	}

	if (idx < 0) {
		return -1;
	}

	return from + idx;
}

function isAscii(runes: Rune[]) {
	for (const rune of runes) {
		if (rune >= 128) {
			return false;
		}
	}

	return true;
}

function asciiFuzzyIndex(
	input: Rune[],
	pattern: Rune[],
	caseSensitive: boolean
): number {
	/*
	 * this https://github.com/junegunn/fzf/blob/7191ebb615f5d6ebbf51d598d8ec853a65e2274d/src/algo/algo.go#L280-L283
	 * is basically checking if input has only ASCII chars, see
	 * https://github.com/junegunn/fzf/blob/7191ebb615f5d6ebbf51d598d8ec853a65e2274d/src/util/chars.go#L38-L43
	 * and https://github.com/junegunn/fzf/blob/7191ebb615f5d6ebbf51d598d8ec853a65e2274d/src/util/chars.go#L48
	 */
	if (!isAscii(input)) {
		return 0;
	}

	if (!isAscii(pattern)) {
		return -1;
	}

	let firstIdx = 0,
		idx = 0;

	for (let pidx = 0; pidx < pattern.length; pidx++) {
		idx = trySkip(input, caseSensitive, pattern[pidx], idx);
		if (idx < 0) {
			return -1;
		}
		if (pidx === 0 && idx > 0) {
			firstIdx = idx - 1;
		}
		idx++;
	}

	return firstIdx;
}

const fuzzyMatchV2: AlgoFn = (
	caseSensitive,
	normalize,
	forward,
	input,
	pattern,
	withPos,
	slab
) => {
	const M = pattern.length;
	if (M === 0) {
		return [{ start: 0, end: 0, score: 0 }, createPosSet(withPos)];
	}

	const N = input.length;

	if (slab !== null && N * M > slab.i16.length) {
		return fuzzyMatchV1(
			caseSensitive,
			normalize,
			forward,
			input,
			pattern,
			withPos,
			slab
		);
	}

	// Phase 1. Optimized search for ASCII string
	const idx = asciiFuzzyIndex(input, pattern, caseSensitive);
	if (idx < 0) {
		return [{ start: -1, end: -1, score: 0 }, null];
	}

	let offset16 = 0,
		offset32 = 0,
		H0: Int16Array | null = null,
		C0: Int16Array | null = null,
		B: Int16Array | null = null,
		F: Int32Array | null = null;
	[offset16, H0] = alloc16(offset16, slab, N);
	[offset16, C0] = alloc16(offset16, slab, N);
	[offset16, B] = alloc16(offset16, slab, N);
	[offset32, F] = alloc32(offset32, slab, M);
	const [, T] = alloc32(offset32, slab, N);

	for (let i = 0; i < T.length; i++) {
		T[i] = input[i];
	}

	// Phase 2. Calculate bonus for each point
	let maxScore = toShort(0),
		maxScorePos = 0;
	let pidx = 0,
		lastIdx = 0;
	const pchar0 = pattern[0];
	let pchar = pattern[0],
		prevH0 = toShort(0),
		prevCharClass = Char.NonWord,
		inGap = false;
	let Tsub = T.subarray(idx);
	let H0sub = H0.subarray(idx).subarray(0, Tsub.length),
		C0sub = C0.subarray(idx).subarray(0, Tsub.length),
		Bsub = B.subarray(idx).subarray(0, Tsub.length);

	for (let [off, char] of Tsub.entries()) {
		let charClass: Char | null = null;

		if (char <= MAX_ASCII) {
			charClass = charClassOfAscii(char);
			if (!caseSensitive && charClass === Char.Upper) {
				char += 32;
			}
		} else {
			charClass = charClassOfNonAscii(char);
			if (!caseSensitive && charClass === Char.Upper) {
				char = String.fromCodePoint(char).toLowerCase().codePointAt(0)!;
			}
			if (normalize) {
				char = normalizeRune(char);
			}
		}

		Tsub[off] = char;
		const bonus = bonusFor(prevCharClass, charClass);
		Bsub[off] = bonus;
		prevCharClass = charClass;

		if (char === pchar) {
			if (pidx < M) {
				F[pidx] = toInt(idx + off);
				pidx++;
				pchar = pattern[Math.min(pidx, M - 1)];
			}
			lastIdx = idx + off;
		}

		if (char === pchar0) {
			const score = SCORE_MATCH + bonus * BONUS_FIRST_CHAR_MULTIPLIER;
			H0sub[off] = score;
			C0sub[off] = 1;
			if (
				M === 1 &&
				((forward && score > maxScore) ||
					(!forward && score >= maxScore))
			) {
				maxScore = score;
				maxScorePos = idx + off;
				// bonus is int16 but BONUS_BOUNDARY is int. It might have needed casting in other lang
				if (forward && bonus === BONUS_BOUNDARY) {
					break;
				}
			}
			inGap = false;
		} else {
			if (inGap) {
				H0sub[off] = maxInt16(prevH0 + SCORE_GAP_EXTENTION, 0);
			} else {
				H0sub[off] = maxInt16(prevH0 + SCORE_GAP_START, 0);
			}
			C0sub[off] = 0;
			inGap = true;
		}
		prevH0 = H0sub[off];
	}

	if (pidx !== M) {
		return [{ start: -1, end: -1, score: 0 }, null];
	}

	if (M === 1) {
		const result: Result = {
			start: maxScorePos,
			end: maxScorePos + 1,
			// maxScore needs to be typecasted from int16 to int in other langs
			score: maxScore
		};
		if (!withPos) {
			return [result, null];
		}
		const pos = new Set<number>();
		pos.add(maxScorePos);
		return [result, pos];
	}

	// Phase 3. Fill in score matrix (H)

	// F[0] needs to be typecasted from int32 to int in other langs
	const f0 = F[0];
	const width = lastIdx - f0 + 1;
	let H: Int16Array | null = null;
	[offset16, H] = alloc16(offset16, slab, width * M);
	{
		const toCopy = H0.subarray(f0, lastIdx + 1);
		for (const [i, v] of toCopy.entries()) {
			H[i] = v;
		}
	}

	let [, C] = alloc16(offset16, slab, width * M);
	{
		const toCopy = C0.subarray(f0, lastIdx + 1);
		for (const [i, v] of toCopy.entries()) {
			C[i] = v;
		}
	}

	const Fsub = F.subarray(1);
	// TODO Psub too needs to needs to be subarray-ed not slice-d but
	// it is only being used in one place and only to retrieve data so
	// it is fine for now
	const Psub = pattern.slice(1).slice(0, Fsub.length);

	for (const [off, f] of Fsub.entries()) {
		// int32 -> int conversion needed in other lang for `f` to use

		let inGap = false;
		const pchar = Psub[off],
			pidx = off + 1,
			row = pidx * width,
			Tsub = T.subarray(f, lastIdx + 1),
			Bsub = B.subarray(f).subarray(0, Tsub.length),
			Csub = C.subarray(row + f - f0).subarray(0, Tsub.length),
			Cdiag = C.subarray(row + f - f0 - 1 - width).subarray(
				0,
				Tsub.length
			),
			Hsub = H.subarray(row + f - f0).subarray(0, Tsub.length),
			Hdiag = H.subarray(row + f - f0 - 1 - width).subarray(
				0,
				Tsub.length
			),
			Hleft = H.subarray(row + f - f0 - 1).subarray(0, Tsub.length);
		Hleft[0] = 0;

		for (const [off, char] of Tsub.entries()) {
			const col = off + f;
			let s1: Int16 = 0,
				s2: Int16 = 0,
				consecutive: Int16 = 0;

			if (inGap) {
				s2 = Hleft[off] + SCORE_GAP_EXTENTION;
			} else {
				s2 = Hleft[off] + SCORE_GAP_START;
			}

			if (pchar === char) {
				s1 = Hdiag[off] + SCORE_MATCH;
				let b = Bsub[off];
				consecutive = Cdiag[off] + 1;

				if (b === BONUS_BOUNDARY) {
					consecutive = 1;
				} else if (consecutive > 1) {
					// `consecutive` needs to be casted to int in other lang
					b = maxInt16(
						b,
						maxInt16(BONUS_CONSECUTIVE, B[col - consecutive + 1])
					);
				}

				if (s1 + b < s2) {
					s1 += Bsub[off];
					consecutive = 0;
				} else {
					s1 += b;
				}
			}
			Csub[off] = consecutive;

			inGap = s1 < s2;
			const score = maxInt16(maxInt16(s1, s2), 0);
			if (
				pidx === M - 1 &&
				((forward && score > maxScore) ||
					(!forward && score >= maxScore))
			) {
				maxScore = score;
				maxScorePos = col;
			}
			Hsub[off] = score;
		}
	}

	if (DEBUG) {
		// TODO debugV2()
	}

	// Phase 4. (Optional) Backtrace to find character positions
	const pos = createPosSet(withPos);
	let j = f0;
	if (withPos && pos !== null) {
		let i = M - 1;
		j = maxScorePos;
		let preferMatch = true;

		while (true) {
			const I = i * width,
				j0 = j - f0,
				s = H[I + j0];

			let s1: Int16 = 0,
				s2: Int16 = 0;

			// F[i] needs to be casted to int in other lang
			if (i > 0 && j >= F[i]) {
				s1 = H[I - width + j0 - 1];
			}

			// F[i] needs to be casted to int in other lang
			if (j > F[i]) {
				s2 = H[I + j0 - 1];
			}

			if (s > s1 && (s > s2 || (s === s2 && preferMatch))) {
				pos.add(j);

				if (i === 0) {
					break;
				}
				i--;
			}

			preferMatch =
				C[I + j0] > 1 ||
				(I + width + j0 + 1 < C.length && C[I + width + j0 + 1] > 0);
			j--;
		}
	}

	// maxScore needs to be typecasted in other lang to `int`
	return [{ start: j, end: maxScorePos + 1, score: maxScore }, pos];
};

function calculateScore(
	caseSensitive: boolean,
	normalize: boolean,
	text: Rune[],
	pattern: Rune[],
	sidx: number,
	eidx: number,
	withPos: boolean
): [number, Set<number> | null] {
	let pidx = 0,
		score = 0,
		inGap = false,
		consecutive = 0,
		firstBonus = toShort(0);

	const pos = createPosSet(withPos);
	let prevCharClass = Char.NonWord;

	if (sidx > 0) {
		prevCharClass = charClassOf(text[sidx - 1]);
	}

	for (let idx = sidx; idx < eidx; idx++) {
		let rune = text[idx];
		const charClass = charClassOf(rune);

		if (!caseSensitive) {
			if (rune >= CAPITAL_A_RUNE && rune <= CAPITAL_Z_RUNE) {
				rune += 32;
			} else if (rune > MAX_ASCII) {
				rune = String.fromCodePoint(rune).toLowerCase().codePointAt(0)!;
			}
		}

		if (normalize) {
			rune = normalizeRune(rune);
		}

		if (rune === pattern[pidx]) {
			if (withPos && pos !== null) {
				pos.add(idx);
			}

			score += SCORE_MATCH;
			let bonus = bonusFor(prevCharClass, charClass);

			if (consecutive === 0) {
				firstBonus = bonus;
			} else {
				if (bonus === BONUS_BOUNDARY) {
					firstBonus = bonus;
				}
				bonus = maxInt16(
					maxInt16(bonus, firstBonus),
					BONUS_CONSECUTIVE
				);
			}

			if (pidx === 0) {
				// whole RHS needs to be casted to int in other lang
				score += bonus * BONUS_FIRST_CHAR_MULTIPLIER;
			} else {
				// whole RHS needs to be casted to int in other lang
				score += bonus;
			}

			inGap = false;
			consecutive++;
			pidx++;
		} else {
			if (inGap) {
				score += SCORE_GAP_EXTENTION;
			} else {
				score += SCORE_GAP_START;
			}

			inGap = true;
			consecutive = 0;
			firstBonus = 0;
		}
		prevCharClass = charClass;
	}
	return [score, pos];
}

const fuzzyMatchV1: AlgoFn = (
	caseSensitive,
	normalize,
	forward,
	text,
	pattern,
	withPos,
	slab
) => {
	if (pattern.length === 0) {
		return [{ start: 0, end: 0, score: 0 }, null];
	}

	if (asciiFuzzyIndex(text, pattern, caseSensitive) < 0) {
		return [{ start: -1, end: -1, score: 0 }, null];
	}

	let pidx = 0,
		sidx = -1,
		eidx = -1;

	const lenRunes = text.length;
	const lenPattern = pattern.length;

	for (let index = 0; index < lenRunes; index++) {
		let rune = text[indexAt(index, lenRunes, forward)];

		if (!caseSensitive) {
			if (rune >= CAPITAL_A_RUNE && rune <= CAPITAL_Z_RUNE) {
				rune += 32;
			} else if (rune > MAX_ASCII) {
				rune = String.fromCodePoint(rune).toLowerCase().codePointAt(0)!;
			}
		}

		if (normalize) {
			rune = normalizeRune(rune);
		}

		const pchar = pattern[indexAt(pidx, lenPattern, forward)];

		if (rune === pchar) {
			if (sidx < 0) {
				sidx = index;
			}

			pidx++;
			if (pidx === lenPattern) {
				eidx = index + 1;
				break;
			}
		}
	}

	if (sidx >= 0 && eidx >= 0) {
		pidx--;

		for (let index = eidx - 1; index >= sidx; index--) {
			const tidx = indexAt(index, lenRunes, forward);
			let rune = text[tidx];

			if (!caseSensitive) {
				if (rune >= CAPITAL_A_RUNE && rune <= CAPITAL_Z_RUNE) {
					rune += 32;
				} else if (rune > MAX_ASCII) {
					rune = String.fromCodePoint(rune)
						.toLowerCase()
						.codePointAt(0)!;
				}
			}

			const pidx_ = indexAt(pidx, lenPattern, forward);
			const pchar = pattern[pidx_];

			if (rune === pchar) {
				pidx--;
				if (pidx < 0) {
					sidx = index;
					break;
				}
			}
		}

		if (!forward) {
			const sidxTemp = sidx;
			sidx = lenRunes - eidx;
			eidx = lenRunes - sidxTemp;
		}

		const [score, pos] = calculateScore(
			caseSensitive,
			normalize,
			text,
			pattern,
			sidx,
			eidx,
			withPos
		);
		return [{ start: sidx, end: eidx, score }, pos];
	}

	return [{ start: -1, end: -1, score: 0 }, null];
};

const exactMatchNaive: AlgoFn = (
	caseSensitive,
	normalize,
	forward,
	text,
	pattern,
	withPos,
	slab
) => {
	if (pattern.length === 0) {
		return [{ start: 0, end: 0, score: 0 }, null];
	}

	const lenRunes = text.length;
	const lenPattern = pattern.length;

	if (lenRunes < lenPattern) {
		return [{ start: -1, end: -1, score: 0 }, null];
	}

	if (asciiFuzzyIndex(text, pattern, caseSensitive) < 0) {
		return [{ start: -1, end: -1, score: 0 }, null];
	}

	let pidx = 0;
	let bestPos = -1,
		bonus = toShort(0),
		bestBonus = toShort(-1);

	for (let index = 0; index < lenRunes; index++) {
		const index_ = indexAt(index, lenRunes, forward);
		let rune = text[index_];

		if (!caseSensitive) {
			if (rune >= CAPITAL_A_RUNE && rune <= CAPITAL_Z_RUNE) {
				rune += 32;
			} else if (rune > MAX_ASCII) {
				rune = String.fromCodePoint(rune).toLowerCase().codePointAt(0)!;
			}
		}

		if (normalize) {
			rune = normalizeRune(rune);
		}

		const pidx_ = indexAt(pidx, lenPattern, forward);
		const pchar = pattern[pidx_];

		if (pchar === rune) {
			if (pidx_ === 0) {
				bonus = bonusAt(text, index_);
			}

			pidx++;
			if (pidx === lenPattern) {
				if (bonus > bestBonus) {
					bestPos = index;
					bestBonus = bonus;
				}

				if (bonus === BONUS_BOUNDARY) {
					break;
				}

				index -= pidx - 1;
				pidx = 0;
				bonus = 0;
			}
		} else {
			index -= pidx;
			pidx = 0;
			bonus = 0;
		}
	}

	if (bestPos >= 0) {
		let sidx = 0,
			eidx = 0;

		if (forward) {
			sidx = bestPos - lenPattern + 1;
			eidx = bestPos + 1;
		} else {
			sidx = lenRunes - (bestPos + 1);
			eidx = lenRunes - (bestPos - lenPattern + 1);
		}

		const [score] = calculateScore(
			caseSensitive,
			normalize,
			text,
			pattern,
			sidx,
			eidx,
			false
		);
		return [{ start: sidx, end: eidx, score }, null];
	}

	return [{ start: -1, end: -1, score: 0 }, null];
};

const prefixMatch: AlgoFn = (
	caseSensitive,
	normalize,
	forward,
	text,
	pattern,
	withPos,
	slab
) => {
	if (pattern.length === 0) {
		return [{ start: 0, end: 0, score: 0 }, null];
	}

	let trimmedLen = 0;
	if (!isWhitespace(pattern[0])) {
		trimmedLen = whitespacesAtStart(text);
	}

	if (text.length - trimmedLen < pattern.length) {
		return [{ start: -1, end: -1, score: 0 }, null];
	}

	for (const [index, r] of pattern.entries()) {
		let rune = text[trimmedLen + index];

		if (!caseSensitive) {
			rune = String.fromCodePoint(rune).toLowerCase().codePointAt(0)!;
		}

		if (normalize) {
			rune = normalizeRune(rune);
		}

		if (rune !== r) {
			return [{ start: -1, end: -1, score: 0 }, null];
		}
	}

	const lenPattern = pattern.length;
	const [score] = calculateScore(
		caseSensitive,
		normalize,
		text,
		pattern,
		trimmedLen,
		trimmedLen + lenPattern,
		false
	);
	return [{ start: trimmedLen, end: trimmedLen + lenPattern, score }, null];
};

const suffixMatch: AlgoFn = (
	caseSensitive,
	normalize,
	forward,
	text,
	pattern,
	withPos,
	slab
) => {
	const lenRunes = text.length;
	let trimmedLen = lenRunes;

	if (
		pattern.length === 0 ||
		!isWhitespace(
			pattern[pattern.length - 1]
		) /* last el in pattern is not a space */
	) {
		trimmedLen -= whitespacesAtEnd(text);
	}

	if (pattern.length === 0) {
		// TODO what?? start and end are same... is this right?
		return [{ start: trimmedLen, end: trimmedLen, score: 0 }, null];
	}

	const diff = trimmedLen - pattern.length;
	if (diff < 0) {
		return [{ start: -1, end: -1, score: 0 }, null];
	}

	for (const [index, r] of pattern.entries()) {
		let rune = text[index + diff];

		if (!caseSensitive) {
			rune = String.fromCodePoint(rune).toLowerCase().codePointAt(0)!;
		}

		if (normalize) {
			rune = normalizeRune(rune);
		}

		if (rune !== r) {
			return [{ start: -1, end: -1, score: 0 }, null];
		}
	}

	const lenPattern = pattern.length;
	const sidx = trimmedLen - lenPattern;
	const eidx = trimmedLen;
	const [score] = calculateScore(
		caseSensitive,
		normalize,
		text,
		pattern,
		sidx,
		eidx,
		false
	);
	return [{ start: sidx, end: eidx, score }, null];
};

const equalMatch: AlgoFn = (
	caseSensitive,
	normalize,
	forward,
	text,
	pattern,
	withPos,
	slab
) => {
	const lenPattern = pattern.length;
	if (lenPattern === 0) {
		return [{ start: -1, end: -1, score: 0 }, null];
	}

	let trimmedLen = 0;
	if (!isWhitespace(pattern[0])) {
		trimmedLen = whitespacesAtStart(text);
	}

	let trimmedEndLen = 0;
	if (!isWhitespace(pattern[lenPattern - 1])) {
		trimmedEndLen = whitespacesAtEnd(text);
	}

	if (text.length - trimmedLen - trimmedEndLen != lenPattern) {
		return [{ start: -1, end: -1, score: 0 }, null];
	}

	let match = true;
	if (normalize) {
		const runes = text;

		for (const [idx, pchar] of pattern.entries()) {
			let rune = runes[trimmedLen + idx];

			if (!caseSensitive) {
				rune = String.fromCodePoint(rune).toLowerCase().codePointAt(0)!;
			}

			if (normalizeRune(pchar) !== normalizeRune(rune)) {
				match = false;
				break;
			}
		}
	} else {
		let runesStr = runesToStr(text).substring(
			trimmedLen,
			text.length - trimmedEndLen
		);

		if (!caseSensitive) {
			runesStr = runesStr.toLowerCase();
		}

		match = runesStr === runesToStr(pattern);
	}

	if (match) {
		return [
			{
				start: trimmedLen,
				end: trimmedLen + lenPattern,
				score:
					(SCORE_MATCH + BONUS_BOUNDARY) * lenPattern +
					(BONUS_FIRST_CHAR_MULTIPLIER - 1) * BONUS_BOUNDARY
			},
			null
		];
	}

	return [{ start: -1, end: -1, score: 0 }, null];
};

// slab.ts

interface Slab {
	i16: Int16Array;
	i32: Int32Array;
}

// from https://github.com/junegunn/fzf/blob/764316a53d0eb60b315f0bbcd513de58ed57a876/src/constants.go#L40
const SLAB_16_SIZE = 100 * 1024; // 200KB * 32 = 12.8MB
const SLAB_32_SIZE = 2048; // 8KB * 32 = 256KB

function makeSlab(size16: number, size32: number): Slab {
	return {
		i16: new Int16Array(size16),
		i32: new Int32Array(size32)
	};
}

// TODO maybe: do not initialise slab unless an fzf algo that needs slab gets called
//
// seems like a slab can be reused **without** setting its arrs' values to 0
// everytime we call algo fn
const slab = makeSlab(SLAB_16_SIZE, SLAB_32_SIZE);

// pattern.ts

enum TermType {
	Fuzzy,
	Exact,
	Prefix,
	Suffix,
	Equal
}

const termTypeMap = {
	[TermType.Fuzzy]: fuzzyMatchV2,
	[TermType.Exact]: exactMatchNaive,
	[TermType.Prefix]: prefixMatch,
	[TermType.Suffix]: suffixMatch,
	[TermType.Equal]: equalMatch
};

interface Term {
	typ: TermType;
	inv: boolean;
	text: Rune[];
	caseSensitive: boolean;
	normalize: boolean;
}

type TermSet = Term[];

function buildPatternForExtendedMatch(
	fuzzy: boolean,
	caseMode: Casing,
	normalize: boolean,
	str: string
) {
	// TODO Implement caching here and below.
	// cacheable is received from caller of this fn
	let cacheable = true;

	str = str.trimLeft();

	// while(str.endsWith(' ') && !str.endsWith('\\ ')) {
	//   str= str.substring(0, str.length - 1)
	// }
	// ^^ simplified below:
	{
		const trimmedAtRightStr = str.trimRight();
		if (
			trimmedAtRightStr.endsWith("\\") &&
			str[trimmedAtRightStr.length] === " "
		) {
			str = trimmedAtRightStr + " ";
		} else {
			str = trimmedAtRightStr;
		}
	}

	// TODO cache not implemented here
	// https://github.com/junegunn/fzf/blob/7191ebb615f5d6ebbf51d598d8ec853a65e2274d/src/pattern.go#L100-L103
	// to implement cache, search for all cache word uses in pattern.go

	// sortable turns to false initially in junegunn/fzf for extended matches
	let sortable = false;
	let termSets: TermSet[] = [];

	termSets = parseTerms(fuzzy, caseMode, normalize, str);

	Loop: for (const termSet of termSets) {
		for (const [idx, term] of termSet.entries()) {
			if (!term.inv) {
				sortable = true;
			}

			if (
				!cacheable ||
				idx > 0 ||
				term.inv ||
				(fuzzy && term.typ !== TermType.Fuzzy) ||
				(!fuzzy && term.typ !== TermType.Exact)
			) {
				cacheable = false;
				if (sortable) {
					break Loop;
				}
			}
		}
	}

	return {
		// this modified str can be used as cache as pattern cache
		// see https://github.com/junegunn/fzf/blob/7191ebb615f5d6ebbf51d598d8ec853a65e2274d/src/pattern.go#L100
		//
		// there is also buildCacheKey https://github.com/junegunn/fzf/blob/7191ebb615f5d6ebbf51d598d8ec853a65e2274d/src/pattern.go#L261
		// which i believe has a different purpose

		str,
		// ^ this in junegunn/fzf is `text: []rune(asString)`

		termSets,
		sortable,
		cacheable,
		fuzzy
	};
}

function parseTerms(
	fuzzy: boolean,
	caseMode: Casing,
	normalize: boolean,
	str: string
): TermSet[] {
	// <backslash><space> to a <tab>
	str = str.replace(/\\ /g, "\t");
	// split on space groups
	const tokens = str.split(/ +/);

	const sets: TermSet[] = [];
	let set: TermSet = [];
	let switchSet = false;
	let afterBar = false;

	for (const token of tokens) {
		let typ = TermType.Fuzzy,
			inv = false,
			text = token.replace(/\t/g, " ");
		const lowerText = text.toLowerCase();

		const caseSensitive =
			caseMode === "case-sensitive" ||
			(caseMode === "smart-case" && text !== lowerText);

		// TODO double conversion here, could be simplified
		const normalizeTerm =
			normalize &&
			lowerText === runesToStr(strToRunes(lowerText).map(normalizeRune));

		if (!caseSensitive) {
			text = lowerText;
		}

		if (!fuzzy) {
			typ = TermType.Exact;
		}

		if (set.length > 0 && !afterBar && text === "|") {
			switchSet = false;
			afterBar = true;
			continue;
		}
		afterBar = false;

		if (text.startsWith("!")) {
			inv = true;
			typ = TermType.Exact;
			text = text.substring(1);
		}

		if (text !== "$" && text.endsWith("$")) {
			typ = TermType.Suffix;
			text = text.substring(0, text.length - 1);
		}

		if (text.startsWith("'")) {
			if (fuzzy && !inv) {
				typ = TermType.Exact;
			} else {
				typ = TermType.Fuzzy;
			}
			text = text.substring(1);
		} else if (text.startsWith("^")) {
			if (typ === TermType.Suffix) {
				typ = TermType.Equal;
			} else {
				typ = TermType.Prefix;
			}
			text = text.substring(1);
		}

		if (text.length > 0) {
			if (switchSet) {
				sets.push(set);
				set = [];
			}
			let textRunes = strToRunes(text);
			if (normalizeTerm) {
				textRunes = textRunes.map(normalizeRune);
			}

			set.push({
				typ,
				inv,
				text: textRunes,
				caseSensitive,
				normalize: normalizeTerm
			});
			switchSet = true;
		}
	}

	if (set.length > 0) {
		sets.push(set);
	}

	return sets;
}

const buildPatternForBasicMatch = (
	query: string,
	casing: Casing,
	normalize: boolean
) => {
	let caseSensitive = false;

	switch (casing) {
		case "smart-case":
			if (query.toLowerCase() !== query) {
				caseSensitive = true;
			}
			break;
		case "case-sensitive":
			caseSensitive = true;
			break;
		case "case-insensitive":
			query = query.toLowerCase();
			caseSensitive = false;
			break;
	}

	let queryRunes = strToRunes(query);
	if (normalize) {
		queryRunes = queryRunes.map(normalizeRune);
	}

	return {
		queryRunes,
		caseSensitive
	};
};

// extended.ts

interface ExtendedFileToken {
	text: Rune[];
	prefixLength: Int32;
}

// this is [int32, int32] in golang code
type Offset = [number, number];

function iter(
	algoFn: AlgoFn,
	tokens: ExtendedFileToken[],
	caseSensitive: boolean,
	normalize: boolean,
	forward: boolean,
	pattern: Rune[],
	slab: Slab
): [Offset, number, Set<number> | null] {
	for (const part of tokens) {
		const [res, pos] = algoFn(
			caseSensitive,
			normalize,
			forward,
			part.text,
			pattern,
			true,
			slab
		);
		if (res.start >= 0) {
			// res.start and res.end were typecasted to int32 here
			const sidx = res.start + part.prefixLength;
			const eidx = res.end + part.prefixLength;
			if (pos !== null) {
				const newPos = new Set<number>();
				// part.prefixLength is typecasted to int here
				pos.forEach((v) => newPos.add(part.prefixLength + v));
				return [[sidx, eidx], res.score, newPos];
			}
			return [[sidx, eidx], res.score, pos];
		}
	}
	return [[-1, -1], 0, null];
}

export function computeExtendedMatch(
	text: Rune[],
	pattern: ReturnType<typeof buildPatternForExtendedMatch>,
	fuzzyAlgo: AlgoFn,
	forward: boolean
) {
	// https://github.com/junegunn/fzf/blob/764316a53d0eb60b315f0bbcd513de58ed57a876/src/pattern.go#L354
	// ^ TODO maybe this helps in caching by not calculating already calculated stuff but whatever
	const input: {
		text: Rune[];
		prefixLength: number;
	}[] = [
		{
			text,
			prefixLength: 0
		}
	];

	const offsets: Offset[] = [];
	let totalScore = 0;
	const allPos = new Set<number>();

	for (const termSet of pattern.termSets) {
		let offset: Offset = [0, 0];
		let currentScore = 0;
		let matched = false;

		for (const term of termSet) {
			let algoFn = termTypeMap[term.typ];
			if (term.typ === TermType.Fuzzy) {
				algoFn = fuzzyAlgo;
			}
			const [off, score, pos] = iter(
				algoFn,
				input,
				term.caseSensitive,
				term.normalize,
				forward,
				term.text,
				slab
			);

			const sidx = off[0];
			if (sidx >= 0) {
				if (term.inv) {
					continue;
				}

				offset = off;
				currentScore = score;
				matched = true;

				if (pos !== null) {
					pos.forEach((v) => allPos.add(v));
				} else {
					for (let idx = off[0]; idx < off[1]; ++idx) {
						// idx is typecasted to int
						allPos.add(idx);
					}
				}
				break;
			} else if (term.inv) {
				offset = [0, 0];
				currentScore = 0;
				matched = true;
				continue;
			}
		}
		if (matched) {
			offsets.push(offset);
			totalScore += currentScore;
		}
	}

	return { offsets, totalScore, allPos };
}

//

function getResultFromScoreMap<T>(
	scoreMap: Record<number, FzfResultItem<T>[]>,
	limit: number
): FzfResultItem<T>[] {
	const scoresInDesc = Object.keys(scoreMap)
		.map((v) => parseInt(v, 10))
		.sort((a, b) => b - a);

	let result: FzfResultItem<T>[] = [];

	for (const score of scoresInDesc) {
		result = result.concat(scoreMap[score]);
		if (result.length >= limit) {
			break;
		}
	}

	return result;
}

function getBasicMatchIter<U>(
	this: BaseFinder<ReadonlyArray<U>>,
	scoreMap: Record<number, FzfResultItem<U>[]>,
	queryRunes: number[],
	caseSensitive: boolean
) {
	return (idx: number) => {
		const itemRunes = this.runesList[idx];
		if (queryRunes.length > itemRunes.length) return;

		let [match, positions] = this.algoFn(
			caseSensitive,
			this.opts.normalize,
			this.opts.forward,
			itemRunes,
			queryRunes,
			true,
			slab
		);
		if (match.start === -1) return;

		// We don't get positions array back for exact match, so we'll fill it by ourselves.
		if (this.opts.fuzzy === false) {
			positions = new Set();
			for (let position = match.start; position < match.end; ++position) {
				positions.add(position);
			}
		}

		// If we aren't sorting, we'll put all items in the same score bucket
		// (we've chosen zero score for it below). This will result in us getting
		// items in the same order in which we've send them in the list.
		const scoreKey = this.opts.sort ? match.score : 0;
		if (scoreMap[scoreKey] === undefined) {
			scoreMap[scoreKey] = [];
		}
		scoreMap[scoreKey].push({
			item: this.items[idx],
			...match,
			positions: positions ?? new Set()
		});
	};
}

function getExtendedMatchIter<U>(
	this: BaseFinder<ReadonlyArray<U>>,
	scoreMap: Record<number, FzfResultItem<U>[]>,
	pattern: ReturnType<typeof buildPatternForExtendedMatch>
) {
	return (idx: number) => {
		const runes = this.runesList[idx];
		const match = computeExtendedMatch(
			runes,
			pattern,
			this.algoFn,
			this.opts.forward
		);
		if (match.offsets.length !== pattern.termSets.length) return;

		let sidx = -1,
			eidx = -1;
		if (match.allPos.size > 0) {
			sidx = Math.min(...match.allPos);
			eidx = Math.max(...match.allPos) + 1;
		}

		const scoreKey = this.opts.sort ? match.totalScore : 0;
		if (scoreMap[scoreKey] === undefined) {
			scoreMap[scoreKey] = [];
		}
		scoreMap[scoreKey].push({
			score: match.totalScore,
			item: this.items[idx],
			positions: match.allPos,
			start: sidx,
			end: eidx
		});
	};
}

// Sync matchers:

function basicMatch<U>(this: SyncFinder<ReadonlyArray<U>>, query: string) {
	const { queryRunes, caseSensitive } = buildPatternForBasicMatch(
		query,
		this.opts.casing,
		this.opts.normalize
	);

	const scoreMap: Record<number, FzfResultItem<U>[]> = {};

	const iter = getBasicMatchIter.bind(this as BaseFinder<readonly U[]>)(
		scoreMap,
		queryRunes,
		caseSensitive
	);
	for (let i = 0, len = this.runesList.length; i < len; ++i) {
		iter(i);
	}

	return getResultFromScoreMap(scoreMap, this.opts.limit);
}

function extendedMatch<U>(this: SyncFinder<ReadonlyArray<U>>, query: string) {
	const pattern = buildPatternForExtendedMatch(
		Boolean(this.opts.fuzzy),
		this.opts.casing,
		this.opts.normalize,
		query
	);

	const scoreMap: Record<number, FzfResultItem<U>[]> = {};

	const iter = getExtendedMatchIter.bind(this as BaseFinder<readonly U[]>)(
		scoreMap,
		pattern
	);
	for (let i = 0, len = this.runesList.length; i < len; ++i) {
		iter(i);
	}

	return getResultFromScoreMap(scoreMap, this.opts.limit);
}

// Async matchers:

const isNode =
	// @ts-ignore TS is configured for browsers so `require` is not present.
	// This is also why we aren't using @ts-expect-error
	typeof require !== "undefined" && typeof window === "undefined";

function asyncMatcher<F>(
	token: Token,
	len: number,
	iter: (index: number) => unknown,
	onFinish: () => F
): Promise<F> {
	return new Promise((resolve, reject) => {
		const INCREMENT = 1000;
		let i = 0,
			end = Math.min(INCREMENT, len);

		const step = () => {
			if (token.cancelled) return reject("search cancelled");

			for (; i < end; ++i) {
				iter(i);
			}

			if (end < len) {
				end = Math.min(end + INCREMENT, len);
				isNode
					? // @ts-ignore unavailable or deprecated for browsers
						setImmediate(step)
					: setTimeout(step);
			} else {
				resolve(onFinish());
			}
		};

		step();
	});
}

function asyncBasicMatch<U>(
	this: AsyncFinder<ReadonlyArray<U>>,
	query: string,
	token: Token
): Promise<FzfResultItem<U>[]> {
	const { queryRunes, caseSensitive } = buildPatternForBasicMatch(
		query,
		this.opts.casing,
		this.opts.normalize
	);

	const scoreMap: Record<number, FzfResultItem<U>[]> = {};

	return asyncMatcher(
		token,
		this.runesList.length,
		getBasicMatchIter.bind(this as BaseFinder<readonly U[]>)(
			scoreMap,
			queryRunes,
			caseSensitive
		),
		() => getResultFromScoreMap(scoreMap, this.opts.limit)
	);
}

function asyncExtendedMatch<U>(
	this: AsyncFinder<ReadonlyArray<U>>,
	query: string,
	token: Token
) {
	const pattern = buildPatternForExtendedMatch(
		Boolean(this.opts.fuzzy),
		this.opts.casing,
		this.opts.normalize,
		query
	);

	const scoreMap: Record<number, FzfResultItem<U>[]> = {};

	return asyncMatcher(
		token,
		this.runesList.length,
		getExtendedMatchIter.bind(this as BaseFinder<readonly U[]>)(
			scoreMap,
			pattern
		),
		() => getResultFromScoreMap(scoreMap, this.opts.limit)
	);
}

// finders.ts

type ArrayElement<ArrayType extends readonly unknown[]> =
	ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

type SortAttrs<U> =
	| {
			sort?: true;
			tiebreakers?: Tiebreaker<U>[];
	  }
	| { sort: false };

type BaseOptsToUse<U> = Omit<Partial<BaseOptions<U>>, "sort" | "tiebreakers"> &
	SortAttrs<U>;

// from https://stackoverflow.com/a/52318137/7683365
type BaseOptionsTuple<U> = U extends string
	? [options?: BaseOptsToUse<U>]
	: [options: BaseOptsToUse<U> & { selector: Selector<U> }];

const defaultOpts: BaseOptions<any> = {
	limit: Infinity,
	selector: (v) => v,
	casing: "smart-case",
	normalize: true,
	fuzzy: "v2",
	// example:
	// tiebreakers: [byLengthAsc, byStartAsc],
	tiebreakers: [],
	sort: true,
	forward: true
};

abstract class BaseFinder<L extends ReadonlyArray<any>> {
	runesList: Rune[][];
	items: L;
	readonly opts: BaseOptions<ArrayElement<L>>;
	algoFn: AlgoFn;

	constructor(list: L, ...optionsTuple: BaseOptionsTuple<ArrayElement<L>>) {
		this.opts = { ...defaultOpts, ...optionsTuple[0] };
		this.items = list;
		this.runesList = list.map((item) =>
			strToRunes(this.opts.selector(item).normalize())
		);
		this.algoFn = exactMatchNaive;
		switch (this.opts.fuzzy) {
			case "v2":
				this.algoFn = fuzzyMatchV2;
				break;
			case "v1":
				this.algoFn = fuzzyMatchV1;
				break;
		}
	}
}

type SyncOptsToUse<U> = BaseOptsToUse<U> &
	Partial<Pick<SyncOptions<U>, "match">>;

type SyncOptionsTuple<U> = U extends string
	? [options?: SyncOptsToUse<U>]
	: [options: SyncOptsToUse<U> & { selector: Selector<U> }];

const syncDefaultOpts: SyncOptions<any> = {
	...defaultOpts,
	match: basicMatch
};

class SyncFinder<L extends ReadonlyArray<any>> extends BaseFinder<L> {
	readonly opts: SyncOptions<ArrayElement<L>>;

	constructor(list: L, ...optionsTuple: SyncOptionsTuple<ArrayElement<L>>) {
		super(list, ...optionsTuple);
		this.opts = { ...syncDefaultOpts, ...optionsTuple[0] };
	}

	find(query: string): FzfResultItem<ArrayElement<L>>[] {
		if (query.length === 0 || this.items.length === 0)
			return this.items
				.slice(0, this.opts.limit)
				.map(createResultItemWithEmptyPos);

		query = query.normalize();

		let result: FzfResultItem<ArrayElement<L>>[] =
			this.opts.match.bind(this)(query);

		return postProcessResultItems(result, this.opts);
	}
}

type AsyncOptsToUse<U> = BaseOptsToUse<U> &
	Partial<Pick<AsyncOptions<U>, "match">>;

type AsyncOptionsTuple<U> = U extends string
	? [options?: AsyncOptsToUse<U>]
	: [options: AsyncOptsToUse<U> & { selector: Selector<U> }];

const asyncDefaultOpts: AsyncOptions<any> = {
	...defaultOpts,
	match: asyncBasicMatch
};

class AsyncFinder<L extends ReadonlyArray<any>> extends BaseFinder<L> {
	readonly opts: AsyncOptions<ArrayElement<L>>;
	token: Token;

	constructor(list: L, ...optionsTuple: AsyncOptionsTuple<ArrayElement<L>>) {
		super(list, ...optionsTuple);
		this.opts = { ...asyncDefaultOpts, ...optionsTuple[0] };
		this.token = { cancelled: false };
	}

	async find(query: string): Promise<FzfResultItem<ArrayElement<L>>[]> {
		this.token.cancelled = true;
		this.token = { cancelled: false };

		if (query.length === 0 || this.items.length === 0)
			return this.items
				.slice(0, this.opts.limit)
				.map(createResultItemWithEmptyPos);

		query = query.normalize();

		let result = (await this.opts.match.bind(this)(
			query,
			this.token
		)) as FzfResultItem<ArrayElement<L>>[];

		return postProcessResultItems(result, this.opts);
	}
}

const createResultItemWithEmptyPos = <U>(item: U): FzfResultItem<U> => ({
	item,
	start: -1,
	end: -1,
	score: 0,
	positions: new Set()
});

function postProcessResultItems<U>(
	result: FzfResultItem<U>[],
	opts: BaseOptions<U>
) {
	if (opts.sort) {
		const { selector } = opts;

		result.sort((a, b) => {
			if (a.score === b.score) {
				for (const tiebreaker of opts.tiebreakers) {
					const diff = tiebreaker(a, b, selector);
					if (diff !== 0) {
						return diff;
					}
				}
			}
			return 0;
		});
	}

	if (Number.isFinite(opts.limit)) {
		result.splice(opts.limit);
	}

	return result;
}

// tiebreakers.ts

function byLengthAsc<U>(
	a: FzfResultItem<U>,
	b: FzfResultItem<U>,
	selector: Selector<U>
): number {
	return selector(a.item).length - selector(b.item).length;
}

function byStartAsc<U>(a: FzfResultItem<U>, b: FzfResultItem<U>): number {
	return a.start - b.start;
}

// main.ts

class Fzf<L extends ReadonlyArray<any>> {
	private finder: SyncFinder<L>;
	find: SyncFinder<L>["find"];

	constructor(list: L, ...optionsTuple: SyncOptionsTuple<ArrayElement<L>>) {
		this.finder = new SyncFinder(list, ...optionsTuple);
		this.find = this.finder.find.bind(this.finder);
	}
}

class AsyncFzf<L extends ReadonlyArray<any>> {
	private finder: AsyncFinder<L>;
	find: AsyncFinder<L>["find"];

	constructor(list: L, ...optionsTuple: AsyncOptionsTuple<ArrayElement<L>>) {
		this.finder = new AsyncFinder(list, ...optionsTuple);
		this.find = this.finder.find.bind(this.finder);
	}
}

// types.ts

interface Token {
	cancelled: boolean;
}

type Casing = "smart-case" | "case-sensitive" | "case-insensitive";

interface FzfResultItem<U = string> extends Result {
	item: U;
	positions: Set<number>;
}

type Selector<U> = BaseOptions<U>["selector"];

type Tiebreaker<U> = (
	a: FzfResultItem<U>,
	b: FzfResultItem<U>,
	selector: Selector<U>
) => number;

interface BaseOptions<U> {
	/**
	 * If `limit` is 32, top 32 items that matches your query will be returned.
	 * By default all matched items are returned.
	 *
	 * @defaultValue `Infinity`
	 */
	limit: number;
	/**
	 * For each item in the list, target a specific property of the item to search for.
	 */
	selector: (v: U) => string;
	/**
	 * Defines what type of case sensitive search you want.
	 *
	 * @defaultValue `"smart-case"`
	 */
	casing: Casing;
	/**
	 * If true, FZF will try to remove diacritics from list items.
	 * This is useful if the list contains items with diacritics but
	 * you want to query with plain A-Z letters.
	 *
	 * @example
	 * Zoë →  Zoe
	 * blessèd →  blessed
	 *
	 * @defaultValue `true`
	 */
	normalize: boolean;
	/**
	 * Fuzzy algo to choose. Each algo has their own advantages, see here:
	 * https://github.com/junegunn/fzf/blob/4c9cab3f8ae7b55f7124d7c3cf7ac6b4cc3db210/src/algo/algo.go#L5
	 * If asssigned `false`, an exact match will be made instead of a fuzzy one.
	 *
	 * @defaultValue `"v2"`
	 */
	fuzzy: "v1" | "v2" | false;
	/**
	 * A list of functions that act as fallback and help to
	 * sort result entries when the score between two entries is tied.
	 *
	 * Consider a tiebreaker to be a [JS array sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
	 * compare function with an added third argument which is `options.selector`.
	 *
	 * If multiple tiebreakers are given, they are evaluated left to right until
	 * one breaks the tie.
	 *
	 * Note that tiebreakers cannot be used if `sort=false`.
	 *
	 * FZF ships with these tiebreakers:
	 * - `byLengthAsc`
	 * - `byStartAsc`
	 *
	 * @defaultValue `[]`
	 *
	 * @example
	 * ```js
	 * function byLengthAsc(a, b, selector) {
	 *   return selector(a.item).length - selector(b.item).length;
	 * }
	 *
	 * const fzf = new Fzf(list, { tiebreakers: [byLengthAsc] })
	 * ```
	 * This will result in following result entries having same score sorted like this:
	 *    FROM                TO
	 * axaa                axaa
	 * bxbbbb              bxbbbb
	 * cxcccccccccc        dxddddddd
	 * dxddddddd           cxcccccccccc
	 */
	tiebreakers: Tiebreaker<U>[];
	/**
	 * If `true`, result items will be sorted in descending order by their score.
	 *
	 * If `false`, result items won't be sorted and tiebreakers won't affect the
	 * sort order either. In this case, the items are returned in the same order
	 * as they are in the input list.
	 *
	 * @defaultValue `true`
	 */
	sort: boolean;
	/**
	 * If `false`, matching will be done from backwards.
	 *
	 * @defaultValue `true`
	 *
	 * @example
	 * /breeds/pyrenees when queried with "re"
	 * with forward=true  : /b**re**eds/pyrenees
	 * with forward=false : /breeds/py**re**nees
	 *
	 * Doing forward=false is useful, for example, if one needs to match a file
	 * path and they prefer querying for the file name over directory names
	 * present in the path.
	 */
	forward: boolean;
}

type SyncOptions<U> = BaseOptions<U> & {
	/**
	 * A function that is responsible for matching list items with the query.
	 *
	 * We ship with two match functions - `basicMatch` and `extendedMatch`.
	 *
	 * If `extendedMatch` is used, you can add special patterns to narrow down your search.
	 * To read about how they can be used, see [this section](https://github.com/junegunn/fzf/tree/7191ebb615f5d6ebbf51d598d8ec853a65e2274d#search-syntax).
	 * For a quick glance, see [this piece](https://github.com/junegunn/fzf/blob/764316a53d0eb60b315f0bbcd513de58ed57a876/src/pattern.go#L12-L19).
	 *
	 * @defaultValue `basicMatch`
	 */
	match: (
		this: SyncFinder<ReadonlyArray<U>>,
		query: string
	) => FzfResultItem<U>[];
};

type AsyncOptions<U> = BaseOptions<U> & {
	/**
	 * A function that is responsible for matching list items with the query.
	 *
	 * We ship with two match functions - `asyncBasicMatch` and `asyncExtendedMatch`.
	 *
	 * If `asyncExtendedMatch` is used, you can add special patterns to narrow down your search.
	 * To read about how they can be used, see [this section](https://github.com/junegunn/fzf/tree/7191ebb615f5d6ebbf51d598d8ec853a65e2274d#search-syntax).
	 * For a quick glance, see [this piece](https://github.com/junegunn/fzf/blob/764316a53d0eb60b315f0bbcd513de58ed57a876/src/pattern.go#L12-L19).
	 *
	 * @defaultValue `asyncBasicMatch`
	 */
	match: (
		this: AsyncFinder<ReadonlyArray<U>>,
		query: string,
		token: Token
	) => Promise<FzfResultItem<U>[]>;
};

// final exports

export {
	AsyncFzf,
	Fzf,
	asyncBasicMatch,
	asyncExtendedMatch,
	basicMatch,
	byLengthAsc,
	byStartAsc,
	extendedMatch
};
