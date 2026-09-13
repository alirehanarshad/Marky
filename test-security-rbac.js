const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== MARKY FULL SECURITY, RBAC & QA TEST SUITE ===\n');
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
    // 1. Test Security Headers
    const healthRes = await fetch(`${BASE_URL}/health`);
    assert(healthRes.headers.get('x-content-type-options') === 'nosniff', 'Security header X-Content-Type-Options: nosniff present');
    assert(healthRes.headers.get('x-frame-options') === 'SAMEORIGIN', 'Security header X-Frame-Options: SAMEORIGIN present');
    assert(healthRes.headers.get('referrer-policy') === 'strict-origin-when-cross-origin', 'Security header Referrer-Policy present');

    // 2. Test Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@marky.ai', password: 'Admin@Marky2026!' })
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginData.success === true && adminLoginData.user.role === 'ADMIN', 'Admin login successful with ADMIN role');
    const adminToken = adminLoginData.token;

    // 3. Test Privilege Escalation Protection during Registration
    const testUserEmail = `user_${Date.now()}@test.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Attacker User',
        email: testUserEmail,
        password: 'Password123!',
        role: 'ADMIN', // Malicious attempt to escalate role
        is_admin: true
      })
    });
    const regData = await regRes.json();
    assert(regData.success === true, 'Public registration succeeded');
    assert(regData.user.role === 'USER', 'Privilege Escalation Blocked: Role forced to USER despite client payload requesting ADMIN');
    const userToken = regData.token;
    const testUserId = regData.user.id;

    // 4. Test RBAC: Normal User Calling Admin Endpoint
    const forbiddenAdminRes = await fetch(`${BASE_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert(forbiddenAdminRes.status === 403, 'RBAC Enforced: Normal user calling GET /api/admin/users received 403 Forbidden');

    // 5. Test RBAC: Admin Calling Admin Endpoint
    const allowedAdminRes = await fetch(`${BASE_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const allowedAdminData = await allowedAdminRes.json();
    assert(allowedAdminRes.status === 200 && allowedAdminData.success === true, 'RBAC Enforced: Administrator calling GET /api/admin/users received 200 OK');
    assert(Array.isArray(allowedAdminData.data) && allowedAdminData.data.length > 0, 'Admin users list retrieved successfully from database');

    // 6. Test SSRF Protection on Competitors URL
    const ssrfLocalhostRes = await fetch(`${BASE_URL}/competitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        name: 'Evil Localhost Competitor',
        websiteUrl: 'http://127.0.0.1:5000/internal-admin'
      })
    });
    const ssrfLocalData = await ssrfLocalhostRes.json();
    assert(ssrfLocalhostRes.status === 400 && ssrfLocalData.error.includes('restricted'), 'SSRF Blocked: Competitor URL pointing to 127.0.0.1 rejected with 400 Bad Request');

    const ssrfMetadataRes = await fetch(`${BASE_URL}/competitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        name: 'Evil Cloud Metadata Competitor',
        websiteUrl: 'http://169.254.169.254/latest/meta-data/'
      })
    });
    assert(ssrfMetadataRes.status === 400, 'SSRF Blocked: AWS / Cloud metadata IP 169.254.169.254 rejected with 400 Bad Request');

    // 7. Test Tenant Isolation & IDOR
    // Register User B
    const userBEmail = `userb_${Date.now()}@test.com`;
    const regBRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'User B',
        email: userBEmail,
        password: 'Password123!'
      })
    });
    const regBData = await regBRes.json();
    const userBToken = regBData.token;

    // User A creates a lead
    const createLeadRes = await fetch(`${BASE_URL}/crm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        name: 'Confidential Lead A',
        company: 'Company A',
        phone: '03001234567',
        email: 'lead_a@example.com'
      })
    });
    const createLeadData = await createLeadRes.json();
    assert(createLeadData.success === true, 'User A successfully created a lead');
    const leadId = createLeadData.data.id;

    // User A can access their own lead
    const getOwnLeadRes = await fetch(`${BASE_URL}/crm/leads/${leadId}`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert(getOwnLeadRes.status === 200, 'User A can view their own lead');

    // User B attempts to access User A's lead (IDOR attack)
    const idorRes = await fetch(`${BASE_URL}/crm/leads/${leadId}`, {
      headers: { 'Authorization': `Bearer ${userBToken}` }
    });
    assert(idorRes.status === 403, 'IDOR Prevented: User B attempting to view User A lead received 403 Forbidden');

    // User B attempts to delete User A's lead
    const idorDeleteRes = await fetch(`${BASE_URL}/crm/${leadId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userBToken}` }
    });
    assert(idorDeleteRes.status === 403, 'IDOR Prevented: User B attempting to delete User A lead received 403 Forbidden');

    // 8. Test Admin Status Invalidation (Account Suspension)
    const suspendRes = await fetch(`${BASE_URL}/admin/users/${testUserId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'SUSPENDED' })
    });
    const suspendData = await suspendRes.json();
    assert(suspendData.success === true && suspendData.data.status === 'SUSPENDED', 'Admin successfully suspended user account');

    // Suspended user attempts to call protected API with existing token
    const suspendedReqRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert(suspendedReqRes.status === 401 || suspendedReqRes.status === 403, 'Session Revocation: Suspended user calling API rejected with 401/403');

    // Reactivate user
    await fetch(`${BASE_URL}/admin/users/${testUserId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'ACTIVE' })
    });

    console.log(`\n=== TEST RESULTS SUMMARY ===`);
    console.log(`Total Passed: ${passed}`);
    console.log(`Total Failed: ${failed}`);

    if (failed === 0) {
      console.log('\n🎉 ALL SECURITY, RBAC & ISOLATION TESTS PASSED PERFECTLY!\n');
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
