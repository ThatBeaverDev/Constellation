export class ShimmedCSS implements CSSStyleDeclaration {
	constructor() {
		this[Symbol.iterator] =
			CSSStyleDeclaration.prototype[Symbol.iterator].bind(this);
	}

	[Symbol.iterator](): ArrayIterator<string> {
		return Object.keys(this)
			.entries()
			.map((item) => item[1]);
	}

	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/accent-color) */
	accentColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/align-content) */
	alignContent = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/align-items) */
	alignItems = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/align-self) */
	alignSelf = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/alignment-baseline) */
	alignmentBaseline = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/all) */
	all = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation) */
	animation = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-composition) */
	animationComposition = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-delay) */
	animationDelay = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-direction) */
	animationDirection = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-duration) */
	animationDuration = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-fill-mode) */
	animationFillMode = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-iteration-count) */
	animationIterationCount = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-name) */
	animationName = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-play-state) */
	animationPlayState = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-timing-function) */
	animationTimingFunction = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/appearance) */
	appearance = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/aspect-ratio) */
	aspectRatio = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter) */
	backdropFilter = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/backface-visibility) */
	backfaceVisibility = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background) */
	background = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-attachment) */
	backgroundAttachment = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-blend-mode) */
	backgroundBlendMode = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-clip) */
	backgroundClip = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-color) */
	backgroundColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-image) */
	backgroundImage = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-origin) */
	backgroundOrigin = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-position) */
	backgroundPosition = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-position-x) */
	backgroundPositionX = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-position-y) */
	backgroundPositionY = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-repeat) */
	backgroundRepeat = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-size) */
	backgroundSize = "";
	baselineShift = "";
	baselineSource = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/block-size) */
	blockSize = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border) */
	border = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block) */
	borderBlock = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block-color) */
	borderBlockColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block-end) */
	borderBlockEnd = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block-end-color) */
	borderBlockEndColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block-end-style) */
	borderBlockEndStyle = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block-end-width) */
	borderBlockEndWidth = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block-start) */
	borderBlockStart = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block-start-color) */
	borderBlockStartColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block-start-style) */
	borderBlockStartStyle = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block-start-width) */
	borderBlockStartWidth = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block-style) */
	borderBlockStyle = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-block-width) */
	borderBlockWidth = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-bottom) */
	borderBottom = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-bottom-color) */
	borderBottomColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-bottom-left-radius) */
	borderBottomLeftRadius = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-bottom-right-radius) */
	borderBottomRightRadius = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-bottom-style) */
	borderBottomStyle = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-bottom-width) */
	borderBottomWidth = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-collapse) */
	borderCollapse = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-color) */
	borderColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-end-end-radius) */
	borderEndEndRadius = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-end-start-radius) */
	borderEndStartRadius = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-image) */
	borderImage = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-image-outset) */
	borderImageOutset = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-image-repeat) */
	borderImageRepeat = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-image-slice) */
	borderImageSlice = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-image-source) */
	borderImageSource = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-image-width) */
	borderImageWidth = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline) */
	borderInline = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline-color) */
	borderInlineColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline-end) */
	borderInlineEnd = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline-end-color) */
	borderInlineEndColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline-end-style) */
	borderInlineEndStyle = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline-end-width) */
	borderInlineEndWidth = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline-start) */
	borderInlineStart = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline-start-color) */
	borderInlineStartColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline-start-style) */
	borderInlineStartStyle = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline-start-width) */
	borderInlineStartWidth = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline-style) */
	borderInlineStyle = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-inline-width) */
	borderInlineWidth = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-left) */
	borderLeft = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-left-color) */
	borderLeftColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-left-style) */
	borderLeftStyle = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-left-width) */
	borderLeftWidth = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-radius) */
	borderRadius = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-right) */
	borderRight = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-right-color) */
	borderRightColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-right-style) */
	borderRightStyle = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-right-width) */
	borderRightWidth = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-spacing) */
	borderSpacing = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-start-end-radius) */
	borderStartEndRadius = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-start-start-radius) */
	borderStartStartRadius = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-style) */
	borderStyle = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-top) */
	borderTop = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-top-color) */
	borderTopColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-top-left-radius) */
	borderTopLeftRadius = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-top-right-radius) */
	borderTopRightRadius = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-top-style) */
	borderTopStyle = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-top-width) */
	borderTopWidth = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-width) */
	borderWidth = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/bottom) */
	bottom = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/box-decoration-break) */
	boxDecorationBreak = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/box-shadow) */
	boxShadow = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/box-sizing) */
	boxSizing = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/break-after) */
	breakAfter = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/break-before) */
	breakBefore = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/break-inside) */
	breakInside = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/caption-side) */
	captionSide = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/caret-color) */
	caretColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/clear) */
	clear = "";
	/**
	 * @deprecated
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/clip)
	 */
	clip = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/clip-path) */
	clipPath = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/clip-rule) */
	clipRule = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/color) */
	color = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/color-interpolation) */
	colorInterpolation = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/color-interpolation-filters) */
	colorInterpolationFilters = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/color-scheme) */
	colorScheme = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/column-count) */
	columnCount = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/column-fill) */
	columnFill = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/column-gap) */
	columnGap = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/column-rule) */
	columnRule = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/column-rule-color) */
	columnRuleColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/column-rule-style) */
	columnRuleStyle = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/column-rule-width) */
	columnRuleWidth = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/column-span) */
	columnSpan = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/column-width) */
	columnWidth = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/columns) */
	columns = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/contain) */
	contain = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/contain-intrinsic-block-size) */
	containIntrinsicBlockSize = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/contain-intrinsic-height) */
	containIntrinsicHeight = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/contain-intrinsic-inline-size) */
	containIntrinsicInlineSize = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/contain-intrinsic-size) */
	containIntrinsicSize = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/contain-intrinsic-width) */
	containIntrinsicWidth = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/container) */
	container = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/container-name) */
	containerName = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/container-type) */
	containerType = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/content) */
	content = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/content-visibility) */
	contentVisibility = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/counter-increment) */
	counterIncrement = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/counter-reset) */
	counterReset = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/counter-set) */
	counterSet = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleDeclaration/cssFloat) */
	cssFloat = "";
	/**
	 * The **`cssText`** property of the CSSStyleDeclaration interface returns or sets the text of the element's **inline** style declaration only.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleDeclaration/cssText)
	 */
	cssText = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/cursor) */
	cursor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/cx) */
	cx = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/cy) */
	cy = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/d) */
	d = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/direction) */
	direction = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/display) */
	display = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/dominant-baseline) */
	dominantBaseline = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/empty-cells) */
	emptyCells = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/fill) */
	fill = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/fill-opacity) */
	fillOpacity = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/fill-rule) */
	fillRule = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/filter) */
	filter = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex) */
	flex = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-basis) */
	flexBasis = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-direction) */
	flexDirection = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-flow) */
	flexFlow = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-grow) */
	flexGrow = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-shrink) */
	flexShrink = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-wrap) */
	flexWrap = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/float) */
	float = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flood-color) */
	floodColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flood-opacity) */
	floodOpacity = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font) */
	font = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-family) */
	fontFamily = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-feature-settings) */
	fontFeatureSettings = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-kerning) */
	fontKerning = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-optical-sizing) */
	fontOpticalSizing = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-palette) */
	fontPalette = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-size) */
	fontSize = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-size-adjust) */
	fontSizeAdjust = "";
	/**
	 * @deprecated
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-stretch)
	 */
	fontStretch = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-style) */
	fontStyle = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-synthesis) */
	fontSynthesis = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-synthesis-small-caps) */
	fontSynthesisSmallCaps = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-synthesis-style) */
	fontSynthesisStyle = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-synthesis-weight) */
	fontSynthesisWeight = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-variant) */
	fontVariant = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-variant-alternates) */
	fontVariantAlternates = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-variant-caps) */
	fontVariantCaps = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-variant-east-asian) */
	fontVariantEastAsian = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-variant-ligatures) */
	fontVariantLigatures = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-variant-numeric) */
	fontVariantNumeric = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-variant-position) */
	fontVariantPosition = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-variation-settings) */
	fontVariationSettings = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/font-weight) */
	fontWeight = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/forced-color-adjust) */
	forcedColorAdjust = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/gap) */
	gap = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid) */
	grid = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-area) */
	gridArea = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-auto-columns) */
	gridAutoColumns = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-auto-flow) */
	gridAutoFlow = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-auto-rows) */
	gridAutoRows = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-column) */
	gridColumn = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-column-end) */
	gridColumnEnd = "";
	/** @deprecated This is a legacy alias of `columnGap`. */
	gridColumnGap = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-column-start) */
	gridColumnStart = "";
	/** @deprecated This is a legacy alias of `gap`. */
	gridGap = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-row) */
	gridRow = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-row-end) */
	gridRowEnd = "";
	/** @deprecated This is a legacy alias of `rowGap`. */
	gridRowGap = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-row-start) */
	gridRowStart = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-template) */
	gridTemplate = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-template-areas) */
	gridTemplateAreas = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-template-columns) */
	gridTemplateColumns = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/grid-template-rows) */
	gridTemplateRows = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/height) */
	height = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/hyphenate-character) */
	hyphenateCharacter = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/hyphenate-limit-chars) */
	hyphenateLimitChars = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/hyphens) */
	hyphens = "";
	/**
	 * @deprecated
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/image-orientation)
	 */
	imageOrientation = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/image-rendering) */
	imageRendering = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/inline-size) */
	inlineSize = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/inset) */
	inset = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/inset-block) */
	insetBlock = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/inset-block-end) */
	insetBlockEnd = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/inset-block-start) */
	insetBlockStart = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/inset-inline) */
	insetInline = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/inset-inline-end) */
	insetInlineEnd = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/inset-inline-start) */
	insetInlineStart = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/isolation) */
	isolation = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/justify-content) */
	justifyContent = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/justify-items) */
	justifyItems = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/justify-self) */
	justifySelf = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/left) */
	left = "";
	/**
	 * The read-only property returns an integer that represents the number of style declarations in this CSS declaration block.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleDeclaration/length)
	 */
	readonly length: number = Object.keys(this).length;
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/letter-spacing) */
	letterSpacing = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/lighting-color) */
	lightingColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/line-break) */
	lineBreak = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/line-height) */
	lineHeight = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/list-style) */
	listStyle = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/list-style-image) */
	listStyleImage = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/list-style-position) */
	listStylePosition = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/list-style-type) */
	listStyleType = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/margin) */
	margin = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/margin-block) */
	marginBlock = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/margin-block-end) */
	marginBlockEnd = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/margin-block-start) */
	marginBlockStart = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/margin-bottom) */
	marginBottom = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/margin-inline) */
	marginInline = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/margin-inline-end) */
	marginInlineEnd = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/margin-inline-start) */
	marginInlineStart = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/margin-left) */
	marginLeft = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/margin-right) */
	marginRight = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/margin-top) */
	marginTop = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/marker) */
	marker = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/marker-end) */
	markerEnd = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/marker-mid) */
	markerMid = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/marker-start) */
	markerStart = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask) */
	mask = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-clip) */
	maskClip = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-composite) */
	maskComposite = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-image) */
	maskImage = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-mode) */
	maskMode = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-origin) */
	maskOrigin = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-position) */
	maskPosition = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-repeat) */
	maskRepeat = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-size) */
	maskSize = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-type) */
	maskType = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/math-depth) */
	mathDepth = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/math-style) */
	mathStyle = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/max-block-size) */
	maxBlockSize = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/max-height) */
	maxHeight = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/max-inline-size) */
	maxInlineSize = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/max-width) */
	maxWidth = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/min-block-size) */
	minBlockSize = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/min-height) */
	minHeight = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/min-inline-size) */
	minInlineSize = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/min-width) */
	minWidth = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mix-blend-mode) */
	mixBlendMode = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/object-fit) */
	objectFit = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/object-position) */
	objectPosition = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/offset) */
	offset = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/offset-anchor) */
	offsetAnchor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/offset-distance) */
	offsetDistance = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/offset-path) */
	offsetPath = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/offset-position) */
	offsetPosition = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/offset-rotate) */
	offsetRotate = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/opacity) */
	opacity = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/order) */
	order = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/orphans) */
	orphans = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/outline) */
	outline = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/outline-color) */
	outlineColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/outline-offset) */
	outlineOffset = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/outline-style) */
	outlineStyle = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/outline-width) */
	outlineWidth = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overflow) */
	overflow = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overflow-anchor) */
	overflowAnchor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overflow-block) */
	overflowBlock = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overflow-clip-margin) */
	overflowClipMargin = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overflow-inline) */
	overflowInline = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overflow-wrap) */
	overflowWrap = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overflow-x) */
	overflowX = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overflow-y) */
	overflowY = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior) */
	overscrollBehavior = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior-block) */
	overscrollBehaviorBlock = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior-inline) */
	overscrollBehaviorInline = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior-x) */
	overscrollBehaviorX = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior-y) */
	overscrollBehaviorY = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/padding) */
	padding = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/padding-block) */
	paddingBlock = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/padding-block-end) */
	paddingBlockEnd = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/padding-block-start) */
	paddingBlockStart = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/padding-bottom) */
	paddingBottom = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/padding-inline) */
	paddingInline = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/padding-inline-end) */
	paddingInlineEnd = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/padding-inline-start) */
	paddingInlineStart = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/padding-left) */
	paddingLeft = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/padding-right) */
	paddingRight = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/padding-top) */
	paddingTop = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/page) */
	page = "";
	/**
	 * @deprecated
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/page-break-after)
	 */
	pageBreakAfter = "";
	/**
	 * @deprecated
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/page-break-before)
	 */
	pageBreakBefore = "";
	/**
	 * @deprecated
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/page-break-inside)
	 */
	pageBreakInside = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/paint-order) */
	paintOrder = "";
	/**
	 * The **CSSStyleDeclaration.parentRule** read-only property returns a CSSRule that is the parent of this style block, e.g., a CSSStyleRule representing the style for a CSS selector.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleDeclaration/parentRule)
	 */
	readonly parentRule: CSSRule | null = null;
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/perspective) */
	perspective = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/perspective-origin) */
	perspectiveOrigin = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/place-content) */
	placeContent = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/place-items) */
	placeItems = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/place-self) */
	placeSelf = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/pointer-events) */
	pointerEvents = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/position) */
	position = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/print-color-adjust) */
	printColorAdjust = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/quotes) */
	quotes = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/r) */
	r = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/resize) */
	resize = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/right) */
	right = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/rotate) */
	rotate = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/row-gap) */
	rowGap = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/ruby-align) */
	rubyAlign = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/ruby-position) */
	rubyPosition = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/rx) */
	rx = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/ry) */
	ry = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scale) */
	scale = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-behavior) */
	scrollBehavior = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-margin) */
	scrollMargin = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-margin-block) */
	scrollMarginBlock = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-margin-block-end) */
	scrollMarginBlockEnd = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-margin-block-start) */
	scrollMarginBlockStart = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-margin-bottom) */
	scrollMarginBottom = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-margin-inline) */
	scrollMarginInline = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-margin-inline-end) */
	scrollMarginInlineEnd = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-margin-inline-start) */
	scrollMarginInlineStart = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-margin-left) */
	scrollMarginLeft = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-margin-right) */
	scrollMarginRight = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-margin-top) */
	scrollMarginTop = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-padding) */
	scrollPadding = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-padding-block) */
	scrollPaddingBlock = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-padding-block-end) */
	scrollPaddingBlockEnd = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-padding-block-start) */
	scrollPaddingBlockStart = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-padding-bottom) */
	scrollPaddingBottom = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-padding-inline) */
	scrollPaddingInline = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-padding-inline-end) */
	scrollPaddingInlineEnd = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-padding-inline-start) */
	scrollPaddingInlineStart = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-padding-left) */
	scrollPaddingLeft = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-padding-right) */
	scrollPaddingRight = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-padding-top) */
	scrollPaddingTop = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-snap-align) */
	scrollSnapAlign = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-snap-stop) */
	scrollSnapStop = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scroll-snap-type) */
	scrollSnapType = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scrollbar-color) */
	scrollbarColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scrollbar-gutter) */
	scrollbarGutter = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/scrollbar-width) */
	scrollbarWidth = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/shape-image-threshold) */
	shapeImageThreshold = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/shape-margin) */
	shapeMargin = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/shape-outside) */
	shapeOutside = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/shape-rendering) */
	shapeRendering = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/stop-color) */
	stopColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/stop-opacity) */
	stopOpacity = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/stroke) */
	stroke = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/stroke-dasharray) */
	strokeDasharray = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/stroke-dashoffset) */
	strokeDashoffset = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/stroke-linecap) */
	strokeLinecap = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/stroke-linejoin) */
	strokeLinejoin = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/stroke-miterlimit) */
	strokeMiterlimit = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/stroke-opacity) */
	strokeOpacity = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/stroke-width) */
	strokeWidth = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/tab-size) */
	tabSize = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/table-layout) */
	tableLayout = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-align) */
	textAlign = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-align-last) */
	textAlignLast = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-anchor) */
	textAnchor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-box) */
	textBox = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-box-edge) */
	textBoxEdge = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-box-trim) */
	textBoxTrim = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-combine-upright) */
	textCombineUpright = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-decoration) */
	textDecoration = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-decoration-color) */
	textDecorationColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-decoration-line) */
	textDecorationLine = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-decoration-skip-ink) */
	textDecorationSkipInk = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-decoration-style) */
	textDecorationStyle = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-decoration-thickness) */
	textDecorationThickness = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-emphasis) */
	textEmphasis = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-emphasis-color) */
	textEmphasisColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-emphasis-position) */
	textEmphasisPosition = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-emphasis-style) */
	textEmphasisStyle = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-indent) */
	textIndent = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-orientation) */
	textOrientation = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-overflow) */
	textOverflow = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-rendering) */
	textRendering = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-shadow) */
	textShadow = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-transform) */
	textTransform = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-underline-offset) */
	textUnderlineOffset = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-underline-position) */
	textUnderlinePosition = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-wrap) */
	textWrap = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-wrap-mode) */
	textWrapMode = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-wrap-style) */
	textWrapStyle = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/top) */
	top = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/touch-action) */
	touchAction = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transform) */
	transform = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transform-box) */
	transformBox = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transform-origin) */
	transformOrigin = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transform-style) */
	transformStyle = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transition) */
	transition = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transition-behavior) */
	transitionBehavior = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transition-delay) */
	transitionDelay = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transition-duration) */
	transitionDuration = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transition-property) */
	transitionProperty = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transition-timing-function) */
	transitionTimingFunction = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/translate) */
	translate = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/unicode-bidi) */
	unicodeBidi = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/user-select) */
	userSelect = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/vector-effect) */
	vectorEffect = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/vertical-align) */
	verticalAlign = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/view-transition-class) */
	viewTransitionClass = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/view-transition-name) */
	viewTransitionName = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/visibility) */
	visibility = "";
	/**
	 * @deprecated This is a legacy alias of `alignContent`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/align-content)
	 */
	webkitAlignContent = "";
	/**
	 * @deprecated This is a legacy alias of `alignItems`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/align-items)
	 */
	webkitAlignItems = "";
	/**
	 * @deprecated This is a legacy alias of `alignSelf`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/align-self)
	 */
	webkitAlignSelf = "";
	/**
	 * @deprecated This is a legacy alias of `animation`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation)
	 */
	webkitAnimation = "";
	/**
	 * @deprecated This is a legacy alias of `animationDelay`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-delay)
	 */
	webkitAnimationDelay = "";
	/**
	 * @deprecated This is a legacy alias of `animationDirection`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-direction)
	 */
	webkitAnimationDirection = "";
	/**
	 * @deprecated This is a legacy alias of `animationDuration`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-duration)
	 */
	webkitAnimationDuration = "";
	/**
	 * @deprecated This is a legacy alias of `animationFillMode`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-fill-mode)
	 */
	webkitAnimationFillMode = "";
	/**
	 * @deprecated This is a legacy alias of `animationIterationCount`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-iteration-count)
	 */
	webkitAnimationIterationCount = "";
	/**
	 * @deprecated This is a legacy alias of `animationName`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-name)
	 */
	webkitAnimationName = "";
	/**
	 * @deprecated This is a legacy alias of `animationPlayState`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-play-state)
	 */
	webkitAnimationPlayState = "";
	/**
	 * @deprecated This is a legacy alias of `animationTimingFunction`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/animation-timing-function)
	 */
	webkitAnimationTimingFunction = "";
	/**
	 * @deprecated This is a legacy alias of `appearance`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/appearance)
	 */
	webkitAppearance = "";
	/**
	 * @deprecated This is a legacy alias of `backfaceVisibility`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/backface-visibility)
	 */
	webkitBackfaceVisibility = "";
	/**
	 * @deprecated This is a legacy alias of `backgroundClip`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-clip)
	 */
	webkitBackgroundClip = "";
	/**
	 * @deprecated This is a legacy alias of `backgroundOrigin`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-origin)
	 */
	webkitBackgroundOrigin = "";
	/**
	 * @deprecated This is a legacy alias of `backgroundSize`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/background-size)
	 */
	webkitBackgroundSize = "";
	/**
	 * @deprecated This is a legacy alias of `borderBottomLeftRadius`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-bottom-left-radius)
	 */
	webkitBorderBottomLeftRadius = "";
	/**
	 * @deprecated This is a legacy alias of `borderBottomRightRadius`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-bottom-right-radius)
	 */
	webkitBorderBottomRightRadius = "";
	/**
	 * @deprecated This is a legacy alias of `borderRadius`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-radius)
	 */
	webkitBorderRadius = "";
	/**
	 * @deprecated This is a legacy alias of `borderTopLeftRadius`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-top-left-radius)
	 */
	webkitBorderTopLeftRadius = "";
	/**
	 * @deprecated This is a legacy alias of `borderTopRightRadius`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/border-top-right-radius)
	 */
	webkitBorderTopRightRadius = "";
	/**
	 * @deprecated This is a legacy alias of `boxAlign`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/box-align)
	 */
	webkitBoxAlign = "";
	/**
	 * @deprecated This is a legacy alias of `boxFlex`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/box-flex)
	 */
	webkitBoxFlex = "";
	/**
	 * @deprecated This is a legacy alias of `boxOrdinalGroup`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/box-ordinal-group)
	 */
	webkitBoxOrdinalGroup = "";
	/**
	 * @deprecated This is a legacy alias of `boxOrient`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/box-orient)
	 */
	webkitBoxOrient = "";
	/**
	 * @deprecated This is a legacy alias of `boxPack`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/box-pack)
	 */
	webkitBoxPack = "";
	/**
	 * @deprecated This is a legacy alias of `boxShadow`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/box-shadow)
	 */
	webkitBoxShadow = "";
	/**
	 * @deprecated This is a legacy alias of `boxSizing`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/box-sizing)
	 */
	webkitBoxSizing = "";
	/**
	 * @deprecated This is a legacy alias of `filter`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/filter)
	 */
	webkitFilter = "";
	/**
	 * @deprecated This is a legacy alias of `flex`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex)
	 */
	webkitFlex = "";
	/**
	 * @deprecated This is a legacy alias of `flexBasis`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-basis)
	 */
	webkitFlexBasis = "";
	/**
	 * @deprecated This is a legacy alias of `flexDirection`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-direction)
	 */
	webkitFlexDirection = "";
	/**
	 * @deprecated This is a legacy alias of `flexFlow`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-flow)
	 */
	webkitFlexFlow = "";
	/**
	 * @deprecated This is a legacy alias of `flexGrow`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-grow)
	 */
	webkitFlexGrow = "";
	/**
	 * @deprecated This is a legacy alias of `flexShrink`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-shrink)
	 */
	webkitFlexShrink = "";
	/**
	 * @deprecated This is a legacy alias of `flexWrap`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/flex-wrap)
	 */
	webkitFlexWrap = "";
	/**
	 * @deprecated This is a legacy alias of `justifyContent`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/justify-content)
	 */
	webkitJustifyContent = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/line-clamp) */
	webkitLineClamp = "";
	/**
	 * @deprecated This is a legacy alias of `mask`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask)
	 */
	webkitMask = "";
	/**
	 * @deprecated This is a legacy alias of `maskBorder`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-border)
	 */
	webkitMaskBoxImage = "";
	/**
	 * @deprecated This is a legacy alias of `maskBorderOutset`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-border-outset)
	 */
	webkitMaskBoxImageOutset = "";
	/**
	 * @deprecated This is a legacy alias of `maskBorderRepeat`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-border-repeat)
	 */
	webkitMaskBoxImageRepeat = "";
	/**
	 * @deprecated This is a legacy alias of `maskBorderSlice`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-border-slice)
	 */
	webkitMaskBoxImageSlice = "";
	/**
	 * @deprecated This is a legacy alias of `maskBorderSource`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-border-source)
	 */
	webkitMaskBoxImageSource = "";
	/**
	 * @deprecated This is a legacy alias of `maskBorderWidth`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-border-width)
	 */
	webkitMaskBoxImageWidth = "";
	/**
	 * @deprecated This is a legacy alias of `maskClip`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-clip)
	 */
	webkitMaskClip = "";
	/**
	 * @deprecated This is a legacy alias of `maskComposite`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-composite)
	 */
	webkitMaskComposite = "";
	/**
	 * @deprecated This is a legacy alias of `maskImage`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-image)
	 */
	webkitMaskImage = "";
	/**
	 * @deprecated This is a legacy alias of `maskOrigin`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-origin)
	 */
	webkitMaskOrigin = "";
	/**
	 * @deprecated This is a legacy alias of `maskPosition`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-position)
	 */
	webkitMaskPosition = "";
	/**
	 * @deprecated This is a legacy alias of `maskRepeat`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-repeat)
	 */
	webkitMaskRepeat = "";
	/**
	 * @deprecated This is a legacy alias of `maskSize`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/mask-size)
	 */
	webkitMaskSize = "";
	/**
	 * @deprecated This is a legacy alias of `order`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/order)
	 */
	webkitOrder = "";
	/**
	 * @deprecated This is a legacy alias of `perspective`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/perspective)
	 */
	webkitPerspective = "";
	/**
	 * @deprecated This is a legacy alias of `perspectiveOrigin`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/perspective-origin)
	 */
	webkitPerspectiveOrigin = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/-webkit-text-fill-color) */
	webkitTextFillColor = "";
	/**
	 * @deprecated This is a legacy alias of `textSizeAdjust`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/text-size-adjust)
	 */
	webkitTextSizeAdjust = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/-webkit-text-stroke) */
	webkitTextStroke = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/-webkit-text-stroke-color) */
	webkitTextStrokeColor = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/-webkit-text-stroke-width) */
	webkitTextStrokeWidth = "";
	/**
	 * @deprecated This is a legacy alias of `transform`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transform)
	 */
	webkitTransform = "";
	/**
	 * @deprecated This is a legacy alias of `transformOrigin`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transform-origin)
	 */
	webkitTransformOrigin = "";
	/**
	 * @deprecated This is a legacy alias of `transformStyle`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transform-style)
	 */
	webkitTransformStyle = "";
	/**
	 * @deprecated This is a legacy alias of `transition`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transition)
	 */
	webkitTransition = "";
	/**
	 * @deprecated This is a legacy alias of `transitionDelay`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transition-delay)
	 */
	webkitTransitionDelay = "";
	/**
	 * @deprecated This is a legacy alias of `transitionDuration`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transition-duration)
	 */
	webkitTransitionDuration = "";
	/**
	 * @deprecated This is a legacy alias of `transitionProperty`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transition-property)
	 */
	webkitTransitionProperty = "";
	/**
	 * @deprecated This is a legacy alias of `transitionTimingFunction`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/transition-timing-function)
	 */
	webkitTransitionTimingFunction = "";
	/**
	 * @deprecated This is a legacy alias of `userSelect`.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/user-select)
	 */
	webkitUserSelect = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/white-space) */
	whiteSpace = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/white-space-collapse) */
	whiteSpaceCollapse = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/widows) */
	widows = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/width) */
	width = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/will-change) */
	willChange = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/word-break) */
	wordBreak = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/word-spacing) */
	wordSpacing = "";
	/**
	 * @deprecated
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/overflow-wrap)
	 */
	wordWrap = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/writing-mode) */
	writingMode = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/x) */
	x = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/y) */
	y = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/z-index) */
	zIndex = "";
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/CSS/zoom) */
	zoom = "";
	/**
	 * The **CSSStyleDeclaration.getPropertyPriority()** method interface returns a string that provides all explicitly set priorities on the CSS property.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleDeclaration/getPropertyPriority)
	 */
	getPropertyPriority(property: string): string {
		return "";
	}
	/**
	 * The **CSSStyleDeclaration.getPropertyValue()** method interface returns a string containing the value of a specified CSS property.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleDeclaration/getPropertyValue)
	 */
	getPropertyValue(property: string): string {
		return "";
	}
	/**
	 * The `CSSStyleDeclaration.item()` method interface returns a CSS property name from a CSSStyleDeclaration by index.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleDeclaration/item)
	 */
	item(index: number): string {
		return "zoom";
	}
	/**
	 * The **`CSSStyleDeclaration.removeProperty()`** method interface removes a property from a CSS style declaration object.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleDeclaration/removeProperty)
	 */
	removeProperty(property: string): string {
		return "";
	}
	/**
	 * The **`CSSStyleDeclaration.setProperty()`** method interface sets a new value for a property on a CSS style declaration object.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CSSStyleDeclaration/setProperty)
	 */
	setProperty(
		property: string,
		value: string | null,
		priority?: string
	): void {}

	[index: number]: string;
}
