/* --------------------------------------------------------------------------
   IMAGE PROVIDER MODULE
   Public API for all consumers (Renderer, Gallery, Special Days, ...).
   Responsibilities:
     - Serve ObjectURLs on demand (cache-first): a photo is only decrypted when
       something asks for it, never "all of them at startup"
     - Prevent duplicate decryptions via an internal Map cache
     - Download an extra data file (the special-day photos) only when it is needed
     - Background preloading of the photos a screen will want soon
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
   * Extra data files requested through loadData(): src → download promise
   * @type {Map<string, Promise<void>>}
   */
  const _dataFiles = new Map();
  let _downloading = 0;

  /**
   * Whether a photo can be served: its data is already in ImageData, or a data
   * file that may still bring it is downloading.
   * @param {string} imageKey
   * @returns {boolean}
   */
  function has(imageKey) {
    return Boolean(ImageData[imageKey]) || _downloading > 0;
  }

  /**
   * Downloads an extra data file (a script that adds photos to ImageData) once.
   * Resolves when its code has run, rejects if it could not be downloaded
   * (a later call tries again).
   * @param {string} src
   * @returns {Promise<void>}
   */
  function loadData(src) {
    if (_dataFiles.has(src)) return _dataFiles.get(src);

    _downloading++;
    // A <script>, not fetch(): index.html keeps working when opened straight from disk
    const download = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => {
        script.remove();
        resolve();
      };
      script.onerror = () => {
        script.remove();
        reject(new Error(`[ImageProvider] Could not download ${src}`));
      };
      document.head.appendChild(script);
    }).finally(() => { _downloading--; });

    _dataFiles.set(src, download);
    download.catch(() => _dataFiles.delete(src));
    return download;
  }

  /**
   * Resolves an image key to its encoded string from ImageData, first waiting
   * for the data files still downloading if the key is not there yet.
   * @param {string} imageKey
   * @returns {Promise<string>} encodedString
   */
  async function _resolve(imageKey) {
    if (!ImageData[imageKey]) {
      await Promise.allSettled([..._dataFiles.values()]);
    }
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
      try {
        const encoded = await _resolve(imageKey);
        const objectUrl = await ImageDecoder.decode(encoded);
        _cache.set(imageKey, objectUrl);
        return objectUrl;
      } finally {
        _pending.delete(imageKey);
      }
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
      .filter(key => key && !_cache.has(key) && has(key))
      .map(key => get(key).catch(err => {
        // Silently handle empty placeholder or unpopulated key
      }));

    await Promise.all(tasks);
  }

  return { has, loadData, get, preload };
})();
