import assert from "node:assert/strict";
import test from "node:test";
import { encrypt, decrypt } from "./encryption.js";

// Helper to encrypt text using the legacy AES-256-CBC method for testing backward compatibility.
async function encryptLegacyCBC(text, keyHex) {
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const keyData = Buffer.from(keyHex, 'hex');
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
  
  const encryptedHex = Array.from(new Uint8Array(encryptedBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const ivHex = Array.from(iv)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
    
  return { encryptedHex, ivHex };
}

test("AES-256-GCM Encryption and Decryption Flow", async () => {
  const originalKey = process.env.AES_KEY;
  // Use a 32-byte (256-bit) hex key
  const testKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  process.env.AES_KEY = testKey;
  
  try {
    const secretText = "hello-github-oauth-token-12345";
    const { encryptedData, iv } = await encrypt(secretText);
    
    assert.ok(encryptedData.startsWith("gcm:v1:"), "Encrypted data should be prefixed with gcm:v1:");
    assert.equal(iv.length, 24, "IV should be 24 hex characters (12 bytes)");
    
    const decrypted = await decrypt(encryptedData, iv);
    assert.equal(decrypted, secretText, "Decrypted text should match the original secret");
  } finally {
    process.env.AES_KEY = originalKey;
  }
});

test("Backward Compatibility: Decrypting Legacy AES-256-CBC Tokens", async () => {
  const originalKey = process.env.AES_KEY;
  const testKey = "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210";
  process.env.AES_KEY = testKey;
  
  try {
    const secretText = "legacy-token-data-goes-here";
    // Encrypt using legacy CBC
    const { encryptedHex, ivHex } = await encryptLegacyCBC(secretText, testKey);
    
    // Decrypt using the refactored decrypt function
    const decrypted = await decrypt(encryptedHex, ivHex);
    assert.equal(decrypted, secretText, "Decrypted legacy CBC text should match original secret");
  } finally {
    process.env.AES_KEY = originalKey;
  }
});

test("Key Rotation: Decryption with Legacy Key fallback", async () => {
  const originalKey = process.env.AES_KEY;
  const originalKeyV1 = process.env.AES_KEY_V1;
  
  const keyA = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const keyB = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
  
  try {
    // 1. Encrypt with Key A
    process.env.AES_KEY = keyA;
    const secretText = "secret-rotation-test";
    const { encryptedData, iv } = await encrypt(secretText);
    
    // 2. Rotate keys: Set active key to Key B, fallback key to Key A
    process.env.AES_KEY = keyB;
    process.env.AES_KEY_V1 = keyA;
    
    // 3. Decrypt should succeed by falling back to AES_KEY_V1
    const decrypted = await decrypt(encryptedData, iv);
    assert.equal(decrypted, secretText, "Should decrypt successfully using key rotation fallback keys");
  } finally {
    process.env.AES_KEY = originalKey;
    process.env.AES_KEY_V1 = originalKeyV1;
  }
});

test("Decryption failure under corrupted key or data", async () => {
  const originalKey = process.env.AES_KEY;
  const testKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  process.env.AES_KEY = testKey;
  
  try {
    const secretText = "corrupt-test";
    const { encryptedData, iv } = await encrypt(secretText);
    
    // Modify encryptedData to corrupt it
    const corruptedData = encryptedData + "f";
    
    await assert.rejects(
      async () => {
        await decrypt(corruptedData, iv);
      },
      /Decryption failed/,
      "Should reject and throw Decryption failed error"
    );
  } finally {
    process.env.AES_KEY = originalKey;
  }
});

test("Encryption failure when AES_KEY is missing", async () => {
  const originalKey = process.env.AES_KEY;
  delete process.env.AES_KEY;
  
  try {
    await assert.rejects(
      async () => {
        await encrypt("some-text");
      },
      /Encryption key missing/,
      "Should throw error when AES_KEY is not configured"
    );
  } finally {
    process.env.AES_KEY = originalKey;
  }
});
