/* --------------------------------------------------------------------------
   IMAGE DECODER MODULE
   Sole responsibility: decode an encrypted Base64 string → ObjectURL.
   Uses native C++ browser data URI decoding for maximum throughput.
   Does NOT cache — caching is the responsibility of ImageProvider.
   -------------------------------------------------------------------------- */

const ImageDecoder = (function () {
  'use strict';

  /**
   * Fast Base64 → ArrayBuffer conversion via C++ native data URI parser.
   * @param {string} base64
   * @returns {Promise<ArrayBuffer>}
   */
  async function _base64ToBuffer(base64) {
    try {
      const res = await fetch('data:application/octet-stream;base64,' + base64);
      return await res.arrayBuffer();
    } catch (e) {
      const bin = atob(base64);
      const len = bin.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = bin.charCodeAt(i);
      }
      return bytes.buffer;
    }
  }

  /**
   * Decodes an encrypted Base64 image string into a usable ObjectURL.
   *
   * Pipeline:
   *   Base64 String
   *     → ArrayBuffer (native fast decode)
   *     → AppCrypto.decrypt() → raw ArrayBuffer
   *     → Blob (auto-detected MIME)
   *     → URL.createObjectURL()
   *     → return ObjectURL string
   *
   * @param {string} encodedString — Base64(IV + Ciphertext)
   * @returns {Promise<string>} — ObjectURL (blob:...)
   */
  async function decode(encodedString) {
    // 1. Base64 → binary buffer via native C++ fast path
    const encryptedBuffer = await _base64ToBuffer(encodedString);

    // 2. Decrypt via AppCrypto
    const plainBuffer = await AppCrypto.decrypt(encryptedBuffer);

    // 3. ArrayBuffer → Blob → ObjectURL
    const blob = new Blob([plainBuffer]);
    return URL.createObjectURL(blob);
  }

  return { decode };
})();
