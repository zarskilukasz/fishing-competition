
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const APP_URL = 'http://localhost:3000'; // Assume dev server is running

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Initialize Supabase Client (for Auth)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runTests() {
  console.log('🚀 Starting API Tests...');

  // 1. Authenticate
  // Note: Providing a test user email/password or asking via prompt would be ideal.
  // For now, let's use a hardcoded test user or assume instructions to set ENV.
  const TEST_EMAIL = process.env.TEST_EMAIL;
  const TEST_PASSWORD = process.env.TEST_PASSWORD;

  if (!TEST_EMAIL || !TEST_PASSWORD) {
    console.error('Please set TEST_EMAIL and TEST_PASSWORD in .env.local or environment');
    process.exit(1);
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (authError || !authData.session) {
    console.error('Login failed:', authError?.message);
    process.exit(1);
  }

  const token = authData.session.access_token;
  const userId = authData.session.user.id;
  console.log('✅ Authenticated as:', userId);

  // Helper for requests
  async function apiRequest(endpoint: string, method: string = 'GET', body?: unknown) {
    // We need to simulate the cookie that Next.js Server Components expect.
    // However, createServerClient in lib/supabase/server.ts reads from `cookies()`.
    // When calling via fetch, we must pass the cookie header.
    // The default cookie name for supabase-ssr is usually `sb-<ref>-auth-token`.
    // We can also try passing `Authorization` header and see if we can patch the server client to accept it,
    // OR just rely on Supabase's cookie handling logic.
    // To properly simulate, we need the exact cookie format.
    // Supabase SSR encodes session data: base64-ish? 
    // Actually, `supabase-js` signInWithPassword sets the session in the client.
    // To get the equivalent Cookie string for the server:
    // It's complex to replicate locally without using the actual SSR client.

    // workaround: use headers that Supabase Auth *might* inspect if we modify server.ts,
    // OR assume `lib/supabase/server.ts` is standard.
    // Standard `createServerClient` reads cookies.

    // Let's try sending Authorization header first. If that fails (401), we know we need cookies.

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}` // Next.js + Supabase SSR usually ignore this unless manually handled
      // Attempting to mock the cookie
      // Cookie: `sb-${process.env.NEXT_PUBLIC_SUPABASE_REFERENCE_ID}-auth-token=...`
    };

    // NOTE: Simulating the cookie correctly is hard. 
    // ALTERNATIVE: Pass `Authorization: Bearer <token>` and ensure `lib/supabase/server.ts` checks it.
    // I will include Authorization header.
    headers['Authorization'] = `Bearer ${token}`;

    // Also include a cookie just in case some middleware respects it?
    // Without correct cookie name (depends on project ref), it's hard.

    try {
      const response = await fetch(`${APP_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json().catch(() => ({}));
      return { status: response.status, data };
    } catch (error: unknown) {
      console.error(`\n❌ API Request Failed: ${method} ${endpoint}`);
      console.error('Error details:', error);
      if (error.cause) {
        console.error('Cause:', error.cause);
        if (error.cause.errors) {
          console.error('Connection errors:', error.cause.errors);
        }
      }
      return { status: 0, data: { error: error.message } };
    }
  }

  // NOTE TO USER: Ensure lib/supabase/server.ts handles Authorization header or you have valid cookies.

  // 2. Create Competition
  console.log('\n--- 2. Create Competition ---');
  const compRes = await apiRequest('/api/competitions', 'POST', {
    name: `Test Competition ${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    pegs_count: 50
  });
  console.log(`Status: ${compRes.status} (Exp: 201)`);
  if (compRes.status !== 201) console.error('Error:', compRes.data);
  const competitionId = compRes.data.id;

  if (!competitionId) {
    console.error('Failed to create competition, stopping.');
    process.exit(1);
  }

  // 3. Add Category
  console.log('\n--- 3. Add Category ---');
  const catRes = await apiRequest(`/api/competitions/${competitionId}/categories`, 'POST', {
    name: 'Senior'
  });
  console.log(`Status: ${catRes.status} (Exp: 201)`);
  const categoryId = catRes.data.id;

  // 4. Add Participant
  console.log('\n--- 4. Add Participant ---');
  const partRes = await apiRequest(`/api/competitions/${competitionId}/participants`, 'POST', {
    first_name: 'Jan',
    last_name: 'Kowalski',
    category_id: categoryId
  });
  console.log(`Status: ${partRes.status} (Exp: 201)`);
  const participantId = partRes.data.id;

  // 5. Add Catch
  console.log('\n--- 5. Add Catch ---');
  const catchRes = await apiRequest(`/api/catches`, 'POST', {
    competition_id: competitionId,
    participant_id: participantId,
    weight: 15.5,
    is_big_fish: true
  });
  console.log(`Status: ${catchRes.status} (Exp: 201)`);

  // 6. Get Leaderboard
  console.log('\n--- 6. Get Leaderboard ---');
  const leaderRes = await apiRequest(`/api/competitions/${competitionId}/leaderboard`);
  console.log(`Status: ${leaderRes.status} (Exp: 200)`);
  console.log('Rankings:', JSON.stringify(leaderRes.data.rankings, null, 2));

  // 7. Cleanup
  console.log('\n--- 7. Cleanup (Delete Competition) ---');
  if (competitionId) {
    const deleteRes = await apiRequest(`/api/competitions/${competitionId}`, 'DELETE');
    console.log(`Status: ${deleteRes.status} (Exp: 200)`);
    if (deleteRes.status === 200) {
      console.log('✅ Competition deleted successfully.');
    } else {
      console.log('❌ Failed to delete competition:', deleteRes.data);
    }
  }

  console.log('\n✅ Tests Completed.');
}

runTests().catch(console.error);
