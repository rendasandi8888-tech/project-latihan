import { generateRandomNJCSParams, njcsEncrypt, njcsDecrypt } from '../lib/encryption/njcs';

function runTest() {
  console.log("=== NJCS Encryption Test ===");
  const params = generateRandomNJCSParams();
  console.log("Generated Params:", params);

  const plaintext = "Hello MediChain! Data pasien rahasia: NIK 1234567890.";
  console.log("\nOriginal text:", plaintext);

  const ciphertext = njcsEncrypt(plaintext, params);
  console.log("Ciphertext (hex):", ciphertext);

  const decrypted = njcsDecrypt(ciphertext, params);
  console.log("Decrypted text:", decrypted);

  if (plaintext === decrypted) {
    console.log("\n✅ SUCCESS: Decrypted text matches original plaintext.");
  } else {
    console.log("\n❌ FAILED: Decrypted text does NOT match.");
  }
}

runTest();
