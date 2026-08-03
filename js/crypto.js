/* --------------------------------------------------------------------------
   CRYPTO MODULE
   AES-256-GCM encryption / decryption via Web Crypto API (PBKDF2 Derived Key).
   This is the ONLY module that knows the algorithm details.
   Key derivation is derived ONCE asynchronously on script load and cached.
   -------------------------------------------------------------------------- */

const AppCrypto = (function () {
  'use strict';

  // ── Key Material (security by obscurity — sufficient for hiding image URLs) ──
  const PASSPHRASE  = 'milove-secret-2026';
  const SALT        = 'milove-salt-static-v1';
  const KEY_ALGO    = 'AES-GCM';
  const KEY_LENGTH  = 256;          // bits
  const IV_BYTE_LEN = 12;           // bytes — recommended for AES-GCM
  const ITERATIONS  = 100_000;
  const HASH_ALGO   = 'SHA-256';

  // Derived key cache — derived ONCE, reused for all images
  let _cachedKeyPromise = null;

  /**
   * Derives the AES-256-GCM key from the passphrase using PBKDF2.
   * Resulting CryptoKey promise is stored and reused.
   * @returns {Promise<CryptoKey>}
   */
  function _getKey() {
    if (_cachedKeyPromise) return _cachedKeyPromise;

    _cachedKeyPromise = (async () => {
      const encoder   = new TextEncoder();
      const rawKey    = encoder.encode(PASSPHRASE);
      const saltBytes = encoder.encode(SALT);

      // Import passphrase as PBKDF2 base key
      const baseKey = await crypto.subtle.importKey(
        'raw',
        rawKey,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      // Derive AES-256-GCM key
      return crypto.subtle.deriveKey(
        {
          name:       'PBKDF2',
          salt:       saltBytes,
          iterations: ITERATIONS,
          hash:       HASH_ALGO,
        },
        baseKey,
        { name: KEY_ALGO, length: KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
      );
    })();

    return _cachedKeyPromise;
  }

  // Pre-warm key derivation asynchronously right away on script evaluation
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    _getKey();
  }

  /**
   * Encrypts an ArrayBuffer.
   * Output format: [IV (12 bytes)] + [Ciphertext]
   * @param {ArrayBuffer} plainBuffer — raw image bytes
   * @returns {Promise<ArrayBuffer>} — IV prepended to ciphertext
   */
  async function encrypt(plainBuffer) {
    const key = await _getKey();
    const iv  = crypto.getRandomValues(new Uint8Array(IV_BYTE_LEN));

    const cipherBuffer = await crypto.subtle.encrypt(
      { name: KEY_ALGO, iv },
      key,
      plainBuffer
    );

    const result = new Uint8Array(IV_BYTE_LEN + cipherBuffer.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(cipherBuffer), IV_BYTE_LEN);

    return result.buffer;
  }

  /**
   * Decrypts an ArrayBuffer produced by encrypt().
   * Input format: [IV (12 bytes)] + [Ciphertext]
   * @param {ArrayBuffer} encryptedBuffer — IV prepended ciphertext
   * @returns {Promise<ArrayBuffer>} — raw image bytes
   */
  async function decrypt(encryptedBuffer) {
    const key   = await _getKey();
    const bytes = new Uint8Array(encryptedBuffer);

    const iv         = bytes.subarray(0, IV_BYTE_LEN);
    const ciphertext = bytes.subarray(IV_BYTE_LEN);

    return crypto.subtle.decrypt(
      { name: KEY_ALGO, iv },
      key,
      ciphertext
    );
  }

  return { encrypt, decrypt };
})();
