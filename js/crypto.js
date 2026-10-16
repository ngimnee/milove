/* --------------------------------------------------------------------------
   CRYPTO MODULE
   AES-256-GCM encryption / decryption via Web Crypto API (PBKDF2 Derived Key).
   This is the ONLY module that knows the algorithm details.
   Key derivation is derived ONCE asynchronously on script load and cached.

   Public API (stored form is always Base64 of [IV (12 bytes)] + [ciphertext]):
     encryptBytes(ArrayBuffer) → Base64      decryptBytes(Base64) → ArrayBuffer   (images)
     encryptText(string)       → Base64      decryptText(Base64)  → string        (letter)
   -------------------------------------------------------------------------- */

const AppCrypto = (function () {
  'use strict';

  // ── Key Material (security by obscurity: hides content from casual viewing, not from a determined reader) ──
  const PASSPHRASE  = 'milove-secret-2026';
  const SALT        = 'milove-salt-static-v1';
  const KEY_ALGO    = 'AES-GCM';
  const KEY_LENGTH  = 256;          // bits
  const IV_BYTE_LEN = 12;           // bytes — recommended for AES-GCM
  const ITERATIONS  = 100_000;
  const HASH_ALGO   = 'SHA-256';

  // Derived key cache — derived ONCE, reused for every encrypt / decrypt call
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
   * @param {ArrayBuffer|Uint8Array} plainBuffer — raw bytes
   * @returns {Promise<ArrayBuffer>} — IV prepended to ciphertext
   */
  async function _encryptBuffer(plainBuffer) {
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
   * Decrypts an ArrayBuffer produced by _encryptBuffer().
   * Input format: [IV (12 bytes)] + [Ciphertext]
   * @param {ArrayBuffer} encryptedBuffer — IV prepended ciphertext
   * @returns {Promise<ArrayBuffer>} — raw bytes
   */
  async function _decryptBuffer(encryptedBuffer) {
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

  // ── Base64 / text helpers (stored data = Base64 of IV + ciphertext) ──

  /**
   * Fast Base64 → ArrayBuffer conversion via the native data URI parser.
   * @param {string} base64
   * @returns {Promise<ArrayBuffer>}
   */
  async function _base64ToBuffer(base64) {
    try {
      const res = await fetch('data:application/octet-stream;base64,' + base64);
      return await res.arrayBuffer();
    } catch {
      const bin = atob(base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
      }
      return bytes.buffer;
    }
  }

  function _bufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const CHUNK = 0x8000;
    let binary = '';
    for (let i = 0; i < bytes.length; i += CHUNK) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return btoa(binary);
  }

  /** @returns {Promise<string>} Base64(IV + ciphertext) of raw bytes (images). */
  async function encryptBytes(plainBuffer) {
    return _bufferToBase64(await _encryptBuffer(plainBuffer));
  }

  /** @returns {Promise<string>} Base64(IV + ciphertext) of a UTF-8 string (letter). */
  function encryptText(text) {
    return encryptBytes(new TextEncoder().encode(text));
  }

  /** @returns {Promise<ArrayBuffer>} raw bytes from a Base64(IV + ciphertext) string. */
  async function decryptBytes(base64) {
    return _decryptBuffer(await _base64ToBuffer(base64));
  }

  /** @returns {Promise<string>} UTF-8 string from a Base64(IV + ciphertext) string. */
  async function decryptText(base64) {
    return new TextDecoder().decode(await decryptBytes(base64));
  }

  return { encryptBytes, decryptBytes, encryptText, decryptText };
})();
