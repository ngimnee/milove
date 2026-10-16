/* --------------------------------------------------------------------------
   IMAGE DECODER MODULE
   Sole responsibility: decode an encrypted Base64 string → ObjectURL.
   Does NOT cache — caching is the responsibility of ImageProvider.
   -------------------------------------------------------------------------- */

const ImageDecoder = (function () {
  'use strict';

  /**
   * Decodes an encrypted Base64 image string into a usable ObjectURL.
   *
   * Pipeline:
   *   Base64 String
   *     → AppCrypto.decryptBytes() → raw ArrayBuffer
   *     → Blob (auto-detected MIME)
   *     → URL.createObjectURL()
   *     → return ObjectURL string
   *
   * @param {string} encodedString — Base64(IV + Ciphertext)
   * @returns {Promise<string>} — ObjectURL (blob:...)
   */
  async function decode(encodedString) {
    // 1. Base64 → decrypt via AppCrypto
    const plainBuffer = await AppCrypto.decryptBytes(encodedString);

    // 2. ArrayBuffer → Blob → ObjectURL
    const blob = new Blob([plainBuffer]);
    return URL.createObjectURL(blob);
  }

  return { decode };
})();
