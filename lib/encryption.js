/**
 * Encrypts a plain text string using AES-256-CBC via the Web Crypto API.
 *
 * @param {string} text - The plain text string to encrypt.
 * @returns {Promise<{encryptedData: string, iv: string}>} An object containing the encrypted data as a hex string and the initialization vector as a hex string.
 * @throws {Error} If the AES_KEY environment variable is missing or invalid, or if encryption fails.
 *
 * @example
 * const { encryptedData, iv } = await encrypt('my-secret-token');
 * // Store encryptedData and iv together for later decryption
 */
/**
 * Retrieves all configured AES keys for decryption to support key rotation.
 * 
 * @returns {Buffer[]} Array of key buffers.
 */
function getKeys() {
  const keys = [];
  if (process.env.AES_KEY) {
    keys.push(Buffer.from(process.env.AES_KEY, 'hex'));
  }
  // Try fetching legacy or rotated keys (e.g. AES_KEY_V1, AES_KEY_V2...)
  let index = 1;
  while (process.env[`AES_KEY_V${index}`]) {
    keys.push(Buffer.from(process.env[`AES_KEY_V${index}`], 'hex'));
    index++;
  }
  return keys;
}

/**
 * Encrypts a plain text string using AES-256-GCM via the Web Crypto API.
 *
 * @param {string} text - The plain text string to encrypt.
 * @returns {Promise<{encryptedData: string, iv: string}>} An object containing the encrypted data (prefixed with gcm:v1:) and the 12-byte initialization vector.
 * @throws {Error} If the AES_KEY environment variable is missing or invalid, or if encryption fails.
 */
export async function encrypt(text) {
  if (!process.env.AES_KEY) {
    throw new Error('Encryption key missing: process.env.AES_KEY is not defined');
  }

  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes is the standard IV size for GCM
  const keyData = Buffer.from(process.env.AES_KEY, 'hex');
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const encryptedHex = Array.from(encryptedArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const ivHex = Array.from(iv)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return {
    encryptedData: 'gcm:v1:' + encryptedHex,
    iv: ivHex,
  };
}

/**
 * Decrypts an encrypted hex string back to plain text, supporting both AES-256-GCM and legacy AES-256-CBC.
 *
 * @param {string} encryptedHex - The encrypted data as a hex string (optionally prefixed with gcm:v1:).
 * @param {string} ivHex - The initialization vector as a hex string.
 * @returns {Promise<string>} The decrypted plain text string.
 * @throws {Error} If no key is configured, the encrypted data is corrupt, or decryption fails with all keys.
 */
export async function decrypt(encryptedHex, ivHex) {
  const isGcm = encryptedHex.startsWith('gcm:v1:');
  const rawEncryptedHex = isGcm ? encryptedHex.slice(7) : encryptedHex;
  
  const ivArray = new Uint8Array(ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const encryptedArray = new Uint8Array(rawEncryptedHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  
  const keys = getKeys();
  if (keys.length === 0) {
    throw new Error('No decryption keys configured (AES_KEY is missing)');
  }
  
  let lastError = null;
  for (const keyData of keys) {
    try {
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: isGcm ? 'AES-GCM' : 'AES-CBC', length: 256 },
        false,
        ['decrypt']
      );
      
      const decryptedBuffer = await crypto.subtle.decrypt(
        isGcm ? { name: 'AES-GCM', iv: ivArray } : { name: 'AES-CBC', iv: ivArray },
        key,
        encryptedArray
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (err) {
      lastError = err;
    }
  }
  
  throw new Error(`Decryption failed: ${lastError ? lastError.message : 'Invalid key or corrupted data'}`);
}