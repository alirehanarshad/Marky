import { initDatabase, db } from './database.js';
import authService from './services/auth.service.js';

async function runSecurityIsolationTests() {
  console.log('================================================================');
  console.log('🛡️ RUNNING COMPREHENSIVE PRODUCTION SECURITY & ISOLATION SUITE');
  console.log('================================================================\n');

  await initDatabase();

  const BASE_URL = 'http://localhost:5000';
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate Admin
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@marky.ai', password: 'Admin@Marky2026!' })
    });
    const adminData = await adminLoginRes.json();
    assert(adminData.success && adminData.token, 'Admin login succeeds with valid JWT');
    const adminToken = adminData.token;

    // 2. Register/Login Tenant User A
    const userAEmail = `tenant_a_${Date.now()}@test.com`;
    const userARegRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Tenant A User', email: userAEmail, password: 'Password@A123' })
    });
    const userAData = await userARegRes.json();
    assert(userAData.success && userAData.token, 'Tenant A registration succeeds');
    const userAToken = userAData.token;
    const userAId = userAData.user.id;

    // 3. Register/Login Tenant User B
    const userBEmail = `tenant_b_${Date.now()}@test.com`;
    const userBRegRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Tenant B User', email: userBEmail, password: 'Password@B123' })
    });
    const userBData = await userBRegRes.json();
    assert(userBData.success && userBData.token, 'Tenant B registration succeeds');
    const userBToken = userBData.token;
    const userBId = userBData.user.id;

    // 4. Test RBAC: Non-admin User B attempting /api/admin/reset-db should receive 403 Forbidden
    const resetAttemptRes = await fetch(`${BASE_URL}/api/admin/reset-db`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userBToken}`
      }
    });
    assert(resetAttemptRes.status === 403, 'Normal user blocked with 403 from /api/admin/reset-db');

    // 5. Test Profile Update: User A updates full name
    const updateProfileRes = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userAToken}`
      },
      body: JSON.stringify({ name: 'Tenant A Updated Name' })
    });
    const updateProfileData = await updateProfileRes.json();
    assert(updateProfileData.success && updateProfileData.user.name === 'Tenant A Updated Name', 'User profile update persists in database');

    // 6. Test Password Change
    const changePassRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userAToken}`
      },
      body: JSON.stringify({ oldPassword: 'Password@A123', newPassword: 'NewPassword@A123' })
    });
    const changePassData = await changePassRes.json();
    assert(changePassData.success, 'User password change succeeds with valid old password');

    // Verify new login with new password
    const newLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userAEmail, password: 'NewPassword@A123' })
    });
    const newLoginData = await newLoginRes.json();
    assert(newLoginData.success && newLoginData.token, 'Login succeeds with new password');

    // 7. Tenant Isolation - Brands: User A creates Brand A
    const createBrandARes = await fetch(`${BASE_URL}/api/brands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userAToken}`
      },
      body: JSON.stringify({
        name: 'Brand Alpha PK',
        category: 'Organic Cosmetics',
        tier: 'Premium',
        brand_voice: 'Luxurious & Pure'
      })
    });
    const brandAData = await createBrandARes.json();
    assert(brandAData.success && brandAData.data.id, 'User A creates Brand Alpha');
    const brandAId = brandAData.data.id;

    // 8. Tenant Isolation - User B queries /api/brands - Must NOT see Brand Alpha
    const userBBrandsRes = await fetch(`${BASE_URL}/api/brands`, {
      headers: { 'Authorization': `Bearer ${userBToken}` }
    });
    const userBBrandsData = await userBBrandsRes.json();
    const userBHasBrandA = (userBBrandsData.data || []).some(b => b.id === brandAId);
    assert(!userBHasBrandA, 'User B cannot see Brand Alpha in list (cross-tenant leakage prevented)');

    // 9. IDOR Defense - User B attempts to access or modify Brand Alpha directly
    const userBAccessBrandARes = await fetch(`${BASE_URL}/api/brands/${brandAId}`, {
      headers: { 'Authorization': `Bearer ${userBToken}` }
    });
    assert(userBAccessBrandARes.status === 404 || userBAccessBrandARes.status === 403, 'User B direct GET of Brand Alpha blocked (403/404)');

    const userBEditBrandARes = await fetch(`${BASE_URL}/api/brands/${brandAId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userBToken}`
      },
      body: JSON.stringify({ name: 'Hacked Brand' })
    });
    assert(userBEditBrandARes.status === 404 || userBEditBrandARes.status === 403, 'User B direct PUT of Brand Alpha blocked (IDOR prevented)');

    // 10. Product-to-Brand Relationship: User A creates Product A1 under Brand A
    const createProdARes = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userAToken}`
      },
      body: JSON.stringify({
        brand_id: brandAId,
        name: 'Organic Face Oil',
        price: 3500,
        sku: 'OFO-01',
        description: 'Cold-pressed organic serum'
      })
    });
    const prodAData = await createProdARes.json();
    assert(prodAData.success && prodAData.data.id, 'Product created successfully linked to Brand Alpha');
    const prodAId = prodAData.data.id;

    // User B attempts to create product claiming Brand Alpha -> Must fail with 403/404
    const userBClaimBrandARes = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userBToken}`
      },
      body: JSON.stringify({
        brand_id: brandAId,
        name: 'Malicious Product',
        price: 100
      })
    });
    assert(userBClaimBrandARes.status === 403 || userBClaimBrandARes.status === 404, 'User B cannot inject product into User A brand');

    // 11. Dashboard real statistics: Empty brand returns honest zeros
    const emptyStatsRes = await fetch(`${BASE_URL}/api/campaigns/stats?brand_id=99999`, {
      headers: { 'Authorization': `Bearer ${userAToken}` }
    });
    const emptyStatsData = await emptyStatsRes.json();
    assert(emptyStatsData.success && emptyStatsData.data.total_budget === 0 && emptyStatsData.data.total_campaigns === 0, 'Empty brand queries return honest 0 metrics without fallback fake data');

    // 12. Campaign creation & Brand Isolation
    const createCampRes = await fetch(`${BASE_URL}/api/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userAToken}`
      },
      body: JSON.stringify({
        name: 'Alpha Launch Campaign',
        brand_id: brandAId,
        budget: 75000,
        currency: 'PKR',
        status: 'Active',
        platforms: 'Meta Advantage+'
      })
    });
    const campData = await createCampRes.json();
    assert(campData.success && campData.data.id, 'Campaign created for Brand Alpha with real budget');

    // Check stats for Brand Alpha reflects real PKR 75,000
    const alphaStatsRes = await fetch(`${BASE_URL}/api/campaigns/stats?brand_id=${brandAId}`, {
      headers: { 'Authorization': `Bearer ${userAToken}` }
    });
    const alphaStatsData = await alphaStatsRes.json();
    assert(alphaStatsData.success && alphaStatsData.data.total_budget === 75000, 'Brand Alpha stats reflects real campaign budget (PKR 75,000)');

    console.log('\n================================================================');
    console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runSecurityIsolationTests();
