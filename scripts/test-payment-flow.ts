import "dotenv/config";
import { encryptPaymentKey, decryptPaymentKey, maskApiKey } from "../src/lib/security/payment-crypto";
import { getPropertyMidtransConfig } from "../src/features/payment/payment-service";
import { prisma } from "../src/lib/db";

async function runPaymentSystemTests() {
  console.log("==================================================");
  console.log("🧪 OSKOST PAYMENT SYSTEM VERIFICATION SUITE");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // TEST 1: Encryption & Decryption with AAD binding
  try {
    const testSecret = "SB-Mid-server-test-secret-key-123456789";
    const propertyId = "prop_test_xyz_123";
    const encrypted = encryptPaymentKey(testSecret, propertyId);
    
    assert(typeof encrypted === "string" && encrypted.length > 50, "Ciphertext is generated");
    assert(!encrypted.includes(testSecret), "Ciphertext does not leak plaintext");

    const decrypted = decryptPaymentKey(encrypted, propertyId);
    assert(decrypted === testSecret, "Decrypted text perfectly matches original secret");

    // Anti key-swapping test: Try decrypting with wrong propertyId
    let swapDetected = false;
    try {
      decryptPaymentKey(encrypted, "prop_tampered_attacker_456");
    } catch {
      swapDetected = true;
    }
    assert(swapDetected, "Anti key-swapping: AAD mismatch correctly rejects decryption");

    // Tampering test: modify one character of ciphertext
    let tamperDetected = false;
    try {
      const parts = encrypted.split(":");
      parts[2] = parts[2].substring(0, 4) + (parts[2][4] === "a" ? "b" : "a") + parts[2].substring(5);
      decryptPaymentKey(parts.join(":"), propertyId);
    } catch {
      tamperDetected = true;
    }
    assert(tamperDetected, "Anti-tampering: NIST GCM auth tag detects any modified bit");
  } catch (err) {
    console.error("Test 1 crashed:", err);
    failed++;
  }

  // TEST 2: Masking API Key
  try {
    const key = "SB-Mid-server-ABC123456789XYZ";
    const masked = maskApiKey(key);
    assert(masked.startsWith("SB-Mid") && masked.endsWith("9XYZ") && masked.includes("••••••••"), "Key masking formats properly");
    assert(maskApiKey(null) === "", "Null key masking safely returns empty string");
  } catch (err) {
    console.error("Test 2 crashed:", err);
    failed++;
  }

  // TEST 3: Pilot Property Database Scoping & Config Resolution
  try {
    const pilotProperty = await prisma.property.findFirst({
      where: { name: { contains: "Pulo Jahe", mode: "insensitive" } },
    });

    assert(pilotProperty !== null, "Pilot property (Pulo Jahe) exists in DB");

    if (pilotProperty) {
      assert(pilotProperty.isMidtransActive === true, "Pilot property has isMidtransActive = true");
      assert(pilotProperty.midtransServerKey !== null, "Pilot property has encrypted midtransServerKey stored");
      assert(pilotProperty.bankAccountNumber !== null, "Pilot property has manual bank account configured");

      const config = getPropertyMidtransConfig(pilotProperty);
      assert(config.isCustomMerchant === true, "getPropertyMidtransConfig resolves isCustomMerchant = true");
      assert(config.serverKey === process.env.MIDTRANS_SERVER_KEY, "getPropertyMidtransConfig successfully decrypts serverKey matching original key");
      assert(config.authHeader.startsWith("Basic "), "getPropertyMidtransConfig generates valid basic auth header");
    }
  } catch (err) {
    console.error("Test 3 crashed:", err);
    failed++;
  }

  console.log("\n==================================================");
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPaymentSystemTests()
  .catch((err) => {
    console.error("FATAL ERROR in test suite:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
