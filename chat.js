// netlify/functions/chat.js
// Secure proxy: keeps the Anthropic API key server-side (never in the browser).
// The honeymoon app calls /.netlify/functions/chat instead of the API directly.
//
// SETUP: In Netlify → Site settings → Environment variables, add:
//   ANTHROPIC_API_KEY = sk-ant-...   (get it from console.anthropic.com)

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not set in Netlify env vars' }) };
  }
  try {
    const payload = JSON.parse(event.body || '{}');
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: payload.model || 'claude-sonnet-4-20250514',
        max_tokens: payload.max_tokens || 800,
        system: payload.system || '',
        tools: payload.tools || undefined,
        messages: payload.messages || []
      })
    });
    const data = await res.json();
    return {
      statusCode: res.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
