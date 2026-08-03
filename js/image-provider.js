/* --------------------------------------------------------------------------
   IMAGE PROVIDER MODULE
   Public API for all consumers (Renderer, Gallery, etc.).
   Responsibilities:
     - Serve ObjectURLs on demand (cache-first)
     - Prevent duplicate decryptions via an internal Map cache
     - Immediate background preloading on startup for zero-latency UI
     - Clean up ObjectURLs to prevent memory leaks
   -------------------------------------------------------------------------- */

const ImageProvider = (function () {
  'use strict';

  /**
   * Internal cache: imageKey (key in ImageData) → ObjectURL (blob:...)
   * @type {Map<string, string>}
   */
  const _cache = new Map();

  /**
   * In-flight decode promises: prevents duplicate simultaneous decodes
   * @type {Map<string, Promise<string>>}
   */
  const _pending = new Map();

  /**
   * Resolves an image key to its encoded string from ImageData.
   * @param {string} imageKey
   * @returns {string} encodedString
   */
  function _resolve(imageKey) {
    const encoded = ImageData[imageKey];
    if (!encoded) {
      throw new Error(`[ImageProvider] Unknown image key: "${imageKey}"`);
    }
    return encoded;
  }

  /**
   * Returns an ObjectURL for the given image key.
   * Decodes on first call, serves instantly from cache on subsequent calls.
   *
   * @param {string} imageKey — key in ImageData (e.g. 'anh-va-em-chibi')
   * @returns {Promise<string>} ObjectURL
   */
  async function get(imageKey) {
    // 1. Cache hit — return immediately (0ms latency)
    if (_cache.has(imageKey)) {
      return _cache.get(imageKey);
    }

    // 2. Already decoding — await in-flight promise
    if (_pending.has(imageKey)) {
      return _pending.get(imageKey);
    }

    // 3. Decode & cache result
    const decodePromise = (async () => {
      const encoded   = _resolve(imageKey);
      if (!encoded || encoded.length === 0) {
        throw new Error(`[ImageProvider] Empty string for key "${imageKey}"`);
      }
      const objectUrl = await ImageDecoder.decode(encoded);
      _cache.set(imageKey, objectUrl);
      _pending.delete(imageKey);
      return objectUrl;
    })();

    _pending.set(imageKey, decodePromise);
    return decodePromise;
  }

  /**
   * Preloads a list of image keys in parallel.
   * @param {string[]} imageKeys
   * @returns {Promise<void>}
   */
  async function preload(imageKeys) {
    const tasks = imageKeys
      .filter(key => key && !_cache.has(key) && ImageData[key] && ImageData[key].length > 0)
      .map(key => get(key).catch(err => {
        // Silently handle empty placeholder or unpopulated key
      }));

    await Promise.all(tasks);
  }

  /**
   * Revokes all cached ObjectURLs and clears the cache.
   */
  function clearCache() {
    _cache.forEach(objectUrl => {
      URL.revokeObjectURL(objectUrl);
    });
    _cache.clear();
    _pending.clear();
  }

  // ── Immediate Auto Preload ─────────────────────────────────────────────
  // Start decoding all images immediately on page load so all 7 images are ready instantly
  if (typeof window !== 'undefined') {
    const _startImmediatePreload = () => {
      if (typeof ImageData !== 'object') return;
      const validKeys = Object.keys(ImageData).filter(k => ImageData[k] && ImageData[k].length > 0);
      if (validKeys.length > 0) {
        preload(validKeys);
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _startImmediatePreload);
    } else {
      setTimeout(_startImmediatePreload, 0);
    }
  }

  return { get, preload, clearCache };
})();
