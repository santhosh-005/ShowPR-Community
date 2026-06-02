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
export async function encrypt(text) {
  const iv = crypto.getRandomValues(new Uint8Array(16));
  
  const keyData = Buffer.from(process.env.AES_KEY, 'hex');
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-CBC', length: 256 },
    false,
    ['encrypt']
  );
  
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
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
    encryptedData: encryptedHex,
    iv: ivHex,
  };
}

/**
 * Decrypts an AES-256-CBC encrypted hex string back to plain text.
 *
 * @param {string} encryptedHex - The encrypted data as a hex string (output from encrypt()).
 * @param {string} ivHex - The initialization vector as a hex string (output from encrypt()).
 * @returns {Promise<string>} The decrypted plain text string.
 * @throws {Error} If the AES_KEY is invalid, the encrypted data is corrupt, or decryption fails.
 *
 * @example
 * const plainText = await decrypt(encryptedData, iv);
 * // plainText === 'my-secret-token'
 */
export async function decrypt(encryptedHex, ivHex) {
  const ivArray = new Uint8Array(ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const encryptedArray = new Uint8Array(encryptedHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  
  const keyData = Buffer.from(process.env.AES_KEY, 'hex');
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-CBC', length: 256 },
    false,
    ['decrypt']
  );
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: ivArray },
    key,
    encryptedArray
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}