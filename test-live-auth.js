const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://awgkgeotpesrtvnzjgzr.supabase.co',
  'sb_publishable_nF4m-mkiJv3J_RzYklUg0g_o6VMXY9u'
);

async function testLive() {
  const email = `testuser_${Date.now()}@gmail.com`;
  const password = 'Password123!';
  
  console.log("Signing up test user:", email);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return console.log("Signup error:", authError.message);
  }
  
  const token = authData.session.access_token;
  console.log("Got token. Calling live API...");

  const res = await fetch("https://ai-saas-dashboard-seven.vercel.app/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `sb-awgkgeotpesrtvnzjgzr-auth-token=${encodeURIComponent(JSON.stringify([token]))}` // Mocking the cookie next-ssr expects
    },
    body: JSON.stringify({
      messages: [{role: "user", content: "Hello from script"}],
      sessionId: "test-session-123"
    })
  });

  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response body:", text);
}

testLive();
