async function test() {
  try {
    const res = await fetch("https://ai-saas-dashboard-seven.vercel.app/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{role: "user", content: "test"}] })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text);
  } catch (e) {
    console.log("Error:", e);
  }
}
test();
