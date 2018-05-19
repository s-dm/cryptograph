
import ArrayUtil from './ArrayUtil'
import ByteEncoder from './ByteEncoder'
import TextEncoder from './TextEncoder'
import TextEncodingError from './Error/TextEncoding'

// empty chain constant, instantiated lazily by Chain.empty
let emptyChain = null

/**
 * Container for storing String, Unicode code point and byte content.
 * When requested, it lazily translates between these representations.
 */
export default class Chain {
  /**
   * Chains can be constructed given either a string, an array of code points
   * or an Uint8Array of bytes.
   * @example
   * let a = new Chain('🦊🚀')
   * let b = new Chain([129418, 128640])
   * let c = new Chain(new Uint8Array([240, 159, 166, 138, 240, 159, 154, 128]))
   * Chain.isEqual(a, b, c) // returns true
   * @param {?number[]|string|Uint8Array} [value=null] Chain content
   * @param {string} [encoding='utf8'] Byte encoding
   */
  constructor (value = null, encoding = 'utf8') {
    this._codePoints = null
    this._string = null
    this._bytes = null

    this._encoding = encoding

    let valueType = Object.prototype.toString.call(value)
    switch (valueType) {
      case '[object Null]':
        // initializes empty chain
        this._codePoints = []
        this._string = ''
        this._bytes = new Uint8Array(0)
        break
      case '[object Array]':
        // initializes chain with code points
        this._codePoints = value
        break
      case '[object String]':
        // initializes chain with a string
        this._string = value
        break
      case '[object Uint8Array]':
        // initializes chain with bytes
        this._bytes = value
        break
      default:
        throw new Error(
          `Chain constructor expects one optional parameter of type ` +
          `Array, String or Uint8Array. Received unexpected ${valueType}.`)
    }
  }

  /**
   * Lazily retrieves the Unicode code point representation.
   * @return {number[]} Array of Unicode code points
   */
  getCodePoints () {
    if (this._codePoints === null) {
      if (this._string !== null) {
        // retrieve code points from string
        this._codePoints = TextEncoder.codePointsFromString(this._string)
      } else {
        // retrieve code points from bytes
        this._codePoints = TextEncoder.codePointsFromBytes(
          this._bytes, this._encoding)
      }
    }
    return this._codePoints
  }

  /**
   * Returns a string for each Unicode character.
   * @return {String[]}
   */
  getChars () {
    return this.getCodePoints().map(codePoint =>
      TextEncoder.stringFromCodePoints([codePoint]))
  }

  /**
   * Returns a new array iterator that contains the Unicode code points for each
   * index. Makes Chains iterable (e.g. using the for...of statement).
   * @return {iterator}
   */
  [Symbol.iterator] () {
    return this.getCodePoints().values
  }

  /**
   * Returns Unicode code point at given index.
   * @param {number} index Unicode code point index
   * @return {number} Unicode code point
   */
  getCodePointAt (index) {
    let codePoints = this.getCodePoints()
    return codePoints[index]
  }

  /**
   * Returns string representation of Unicode character at given index.
   * @param {number} index Unicode code point index
   * @return {string} Character
   */
  getCharAt (index) {
    return TextEncoder.stringFromCodePoints([this.getCodePointAt(index)])
  }

  /**
   * Returns byte representation of a Unicode character at given index.
   * @param {number} index Unicode code point index
   * @return {Uint8Array} Character bytes
   */
  getCharBytesAt (index) {
    return TextEncoder.bytesFromCodePoints([this.getCodePointAt(index)])
  }

  /**
   * Returns amount of Unicode code points.
   * @return {number} Amount of Unicode code points
   */
  getLength () {
    return this.getCodePoints().length
  }

  /**
   * Lazily retrieves the string representation.
   * @return {string}
   */
  getString () {
    // lazily retrieve string
    if (this._string === null) {
      // retrieve string from code points
      this._string = TextEncoder.stringFromCodePoints(this.getCodePoints())
    }
    return this._string
  }

  /**
   * Alias of {@link Chain.getString}.
   * @return {string}
   */
  toString () {
    return this.getString()
  }

  /**
   * Returns lower case representation of this Chain.
   * @return {Chain} Lower case Chain
   */
  toLowerCase () {
    return Chain.wrap(this.getString().toLowerCase(), this._encoding)
  }

  /**
   * Returns upper case representation of this Chain.
   * @return {Chain} Upper case Chain
   */
  toUpperCase () {
    return Chain.wrap(this.getString().toUpperCase(), this._encoding)
  }

  /**
   * Splits a Chain object into an array of Chains by separating it, using a
   * specified separator string or Chain to determine where to make each split.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
   * @param {string|Chain} [separator]
   * @param {number} [limit]
   * @return {Chain[]}
   */
  split (separator = undefined, limit = undefined) {
    return this.getString()
      .split(separator ? separator.toString() : undefined, limit)
      .map(stringPart => Chain.wrap(stringPart, this._encoding))
  }

  /**
   * Returns the characters in a string beginning at the specified location
   * through the specified number of characters.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/substr
   * @param {number} start
   * @param {number} [length]
   * @return {Chain}
   */
  substr (start, length = undefined) {
    if (length <= 0 || start >= this.getLength()) {
      // return empty chain
      return Chain.empty()
    }

    if (start < 0) {
      start = Math.max(this.getLength() + start, 0)
    }

    // slice code points
    let codePoints = this.getCodePoints()
      .slice(start, length ? start + length : undefined)

    return Chain.wrap(codePoints, this._encoding)
  }

  /**
   * Truncates Chain to given length and adds ellipsis if truncated.
   * @param {number} length Length the string should be truncated to.
   * @return {Chain} Truncated Chain
   */
  truncate (length) {
    return this.getLength() > length
      ? Chain.wrap(this.substr(0, length).getString() + '…', this._encoding)
      : this
  }

  /**
   * Retrieves the matches when matching a string against a regular expression.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
   * @param {RegExp|string} regexp A regular expression object.
   * @return {?array}
   */
  match (regexp) {
    return this.getString().match(regexp)
  }

  /**
   * Returns a string describing the content of this Chain.
   * @return {string}
   */
  getDescription () {
    if (this._string !== null) {
      return `String(${this._string})`
    } else if (this._codePoints !== null) {
      return `CodePoints(${this._codePoints.join(', ')})`
    } else {
      return `Bytes(${ByteEncoder.hexStringFromBytes(this._bytes)})`
    }
  }

  /**
   * Returns wether given text is contained in this Chain.
   * @param {Chain|string} needle String or Chain to search for.
   * @return {boolean}
   */
  contains (needle) {
    return this.getString().indexOf(needle.toString()) !== -1
  }

  /**
   * Returns the first index at which a given code point can be found
   * and -1 if not found.
   * @param {number} codePoint Unicode code point to search for.
   * @param {number} [start] Index to start the search at.
   * @return {number} Code point index; -1 if not found.
   */
  indexOfCodePoint (codePoint, start = undefined) {
    return this.getCodePoints().indexOf(codePoint, start)
  }

  /**
   * Returns the first index at which a given string can be found
   * and -1 if not found.
   * @param {string|Chain} value Search element
   * @param {number} [start] Index to start the search at.
   * @return {number} Code point index; -1 if not found.
   */
  indexOf (value, start = undefined) {
    // find element in string representation
    let string = this.getString()
    let stringIndex = string.indexOf(value.toString(), start)

    if (stringIndex === -1) {
      // not found
      return -1
    } else {
      // translate string index into code point index
      let leftPartString = string.substr(0, stringIndex)
      let leftPartCodePoints = TextEncoder.codePointsFromString(leftPartString)
      return leftPartCodePoints.length
    }
  }

  /**
   * Lazily retrieves the byte representation.
   * @return {Uint8Array} Uint8Array of bytes.
   */
  getBytes () {
    // lazily retrieve bytes
    if (this._bytes === null) {
      // retrieve bytes from code points
      this._bytes = TextEncoder.bytesFromCodePoints(
        this.getCodePoints(), this._encoding)
    }
    return this._bytes
  }

  /**
   * Returns byte value at index.
   * @param {number} index Byte index
   * @return {number} Byte
   */
  getByteAt (index) {
    let bytes = this.getBytes()
    return bytes[index]
  }

  /**
   * Returns the amount of bytes.
   * @return {number} Amount of bytes
   */
  getSize () {
    return this.getBytes().length
  }

  /**
   * Returns true, if text encoding is needed before returning the string or
   * code point representation. Translation between text and bytes may throw an
   * error if encountering malformed content.
   * @return {boolean}
   */
  needsTextEncoding () {
    return this._codePoints === null && this._string === null
  }

  /**
   * Returns true, if byte encoding is needed before returning the byte
   * representation. Translation between text and bytes may throw an error
   * if encountering malformed content.
   * @return {boolean}
   */
  needsByteEncoding () {
    return this._bytes === null
  }

  /**
   * Returns true if Chain contains an empty string, zero Unicode
   * characters or bytes.
   * @return {boolean}
   */
  isEmpty () {
    return (
      (this._codePoints !== null && this._codePoints.length === 0) ||
      (this._string !== null && this._string === '') ||
      (this._bytes !== null && this._bytes.length === 0)
    )
  }

  /**
   * Returns true if this Chain's content is equal to given Chain's content.
   * Only encodes or decodes between text and bytes if necessary.
   * @param {?Chain} chain Chain to compare to.
   * @return {boolean} True, if content is equal.
   */
  isEqualTo (chain) {
    // check pointer
    if (chain === this) {
      return true
    }

    // check instance class
    if (!(chain instanceof Chain)) {
      return false
    }

    // check if empty
    if (this.isEmpty() && chain.isEmpty()) {
      return true
    }

    // check encoding
    if (chain.getEncoding() !== this._encoding) {
      return false
    }

    // compare string instance (fast)
    if (this._string !== null && this._string === chain._string) {
      return true
    }

    // check if both chains use byte representation
    if (this._bytes !== null && chain._bytes !== null) {
      return ArrayUtil.isEqual(this._bytes, chain._bytes)
    }

    try {
      // compare code points of chains
      // translation between text and bytes may throw a text encoding error
      return ArrayUtil.isEqual(this.getCodePoints(), chain.getCodePoints())
    } catch (error) {
      if (error instanceof TextEncodingError) {
        // translation to the *lowest common denominator* failed
        // chains are not comparable, consider them not equal
        return false
      } else {
        throw error
      }
    }
  }

  /**
   * Returns byte encoding this Chain has been created with.
   * @return {string} Byte encoding
   */
  getEncoding () {
    return this._encoding
  }

  /**
   * Returns true if the content of given chains is equal.
   * Uses {@link Chain.isEqualTo} internally.
   * @param {?...Chain} chains Chains to compare.
   * @return {boolean} True, if content is equal.
   */
  static isEqual (...chains) {
    if (chains.length < 2) {
      return true
    }

    // retrieve first chain and verify instance
    let first = chains[0]
    if (!(first instanceof Chain)) {
      return false
    }

    // compare first chain to others
    let equal = true
    let i = 0
    while (equal && ++i < chains.length) {
      equal = first.isEqualTo(chains[i])
    }
    return equal
  }

  /**
   * Wraps value inside a Chain object if it is not already a Chain.
   * @param {?number[]|string|Uint8Array|Chain} value
   * @param {string} [encoding='utf8'] Byte encoding
   * @return {Chain}
   */
  static wrap (value, encoding = 'utf8') {
    if (value instanceof Chain) {
      // nothing to do, value already is a chain object
      return value
    }
    if (value === null || value.length === 0) {
      // use empty chain constant when possible
      return Chain.empty()
    }
    // create new chain object
    return new Chain(value, encoding)
  }

  /**
   * Joins all elements of an array (or an array-like object) into a Chain.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join
   * @param {array} elements
   * @param {string|Chain} [separator]
   * @return {Chain}
   */
  static join (elements, separator = undefined) {
    return Chain.wrap(
      elements
        .map(element => element.toString())
        .join(separator))
  }

  /**
   * Returns the empty Chain constant.
   * @return {Chain} Empty Chain
   */
  static empty () {
    if (emptyChain === null) {
      emptyChain = new Chain()
    }
    return emptyChain
  }
}
