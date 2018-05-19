
import Factory from '../Factory'

// package bricks
import AffineCipherEncoder from '../Encoder/AffineCipher'
import Ascii85Encoder from '../Encoder/Ascii85'
import AtbashEncoder from '../Encoder/Atbash'
import Base64Encoder from '../Encoder/Base64'
import BitwiseOperationEncoder from '../Encoder/BitwiseOperation'
import BytesViewer from '../Viewer/Bytes'
import CaesarCipherEncoder from '../Encoder/CaesarCipher'
import EnigmaEncoder from '../Encoder/Enigma'
import HashEncoder from '../Encoder/Hash'
import HMACEncoder from '../Encoder/HMAC'
import IntegerEncoder from '../Encoder/Integer'
import MorseCodeEncoder from '../Encoder/MorseCode'
import NumeralSystemEncoder from '../Encoder/NumeralSystem'
import ROT13Encoder from '../Encoder/ROT13'
import SpellingAlphabetEncoder from '../Encoder/SpellingAlphabet'
import TextTransformEncoder from '../Encoder/TextTransform'
import TextViewer from '../Viewer/Text'
import UnicodeCodePointsEncoder from '../Encoder/UnicodeCodePoints'
import URLEncoder from '../Encoder/URL'
import VigenereCipherEncoder from '../Encoder/VigenereCipher'

// singleton instance
let instance = null

/**
 * Factory for Brick objects.
 */
export default class BrickFactory extends Factory {
  /**
   * Brick Factory constructor.
   */
  constructor () {
    super()

    // gather package brick classes
    let invokables = [
      TextViewer,
      BytesViewer,
      TextTransformEncoder,
      NumeralSystemEncoder,
      BitwiseOperationEncoder,
      SpellingAlphabetEncoder,
      CaesarCipherEncoder,
      AtbashEncoder,
      AffineCipherEncoder,
      ROT13Encoder,
      VigenereCipherEncoder,
      EnigmaEncoder,
      UnicodeCodePointsEncoder,
      URLEncoder,
      Base64Encoder,
      Ascii85Encoder,
      MorseCodeEncoder,
      IntegerEncoder,
      HashEncoder,
      HMACEncoder
    ]

    // register each brick
    invokables.forEach(this.register.bind(this))
  }

  /**
   * Registers brick invokable.
   * @param {class} invokable
   * @throws Throws an error if identifier already exists.
   * @return {BrickFactory} Fluent interface
   */
  register (invokable) {
    let identifier = invokable.getMeta().name
    return super.register(identifier, invokable)
  }

  /**
   * Returns brick meta for given identifier.
   * @throws Throws an error if identifier does not exist.
   * @param {string} identifier
   * @return {object} Brick meta
   */
  getMeta (identifier) {
    return this.getInvokable(identifier).getMeta()
  }

  /**
   * Get brick factory singleton instance.
   * @return {BrickFactory}
   */
  static getInstance () {
    if (instance === null) {
      instance = new BrickFactory()
    }
    return instance
  }
}
