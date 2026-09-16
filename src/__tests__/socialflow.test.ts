import { encryptSecret, decryptSecret } from '../lib/encryption';
import { hasPermission, canApprovePosts, canPublishDirectly } from '../lib/rbac';
import { providerFactory } from '../services/social/provider-factory';

async function runTests() {
  console.log('🧪 Running SocialFlow Automated Test Suite...');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Encryption & Decryption Tests
  console.log('\n--- 1. Cryptographic Security Tests (AES-256-GCM) ---');
  const plainSecret = 'ya29.a0AfH6SMD_real_oauth_token_secret_99182';
  const encrypted = encryptSecret(plainSecret);
  assert(Boolean(encrypted.encrypted && encrypted.iv && encrypted.authTag), 'Encrypts secret with IV and auth tag');
  const decrypted = decryptSecret(encrypted.encrypted, encrypted.iv, encrypted.authTag);
  assert(decrypted === plainSecret, 'Decrypted secret matches original plaintext exactly');

  // 2. RBAC Permissions Matrix Tests
  console.log('\n--- 2. Role-Based Access Control (RBAC) Tests ---');
  assert(hasPermission('OWNER', 'workspace:delete') === true, 'Owner has workspace:delete permission');
  assert(hasPermission('EDITOR', 'workspace:delete') === false, 'Editor cannot delete workspace');
  assert(canApprovePosts('MANAGER') === true, 'Manager can approve posts');
  assert(canApprovePosts('EDITOR') === false, 'Editor cannot approve posts');
  assert(canPublishDirectly('ADMIN') === true, 'Admin can publish directly');
  assert(canPublishDirectly('VIEWER') === false, 'Viewer cannot publish');
  assert(hasPermission('ANALYST', 'reports:export') === true, 'Analyst can export reports');

  // 3. Provider Adapter Engine & Capabilities
  console.log('\n--- 3. Social Provider Adapter Capabilities Tests ---');
  const providers = providerFactory.getAllProviders();
  assert(providers.length === 8, 'All 8 providers registered (LinkedIn, FB, IG, X, TikTok, YouTube, Pinterest, Threads)');

  const twitter = providerFactory.getProvider('TWITTER');
  assert(twitter.capabilities.characterLimit === 280, 'Twitter character limit is 280');
  const twitterValid = twitter.validatePayload({ content: 'Hello SocialFlow!' });
  assert(twitterValid.valid === true, 'Valid tweet payload passes check');
  const twitterTooLong = twitter.validatePayload({ content: 'A'.repeat(300) });
  assert(twitterTooLong.valid === false, 'Oversized tweet is rejected by capability validator');

  const instagram = providerFactory.getProvider('INSTAGRAM');
  assert(instagram.capabilities.requiresMediaForPosting === true, 'Instagram requires media asset');
  const igNoMedia = instagram.validatePayload({ content: 'Just text' });
  assert(igNoMedia.valid === false, 'Instagram text-only post is rejected by capability validator');

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
