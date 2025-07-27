const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.SITE_URL || 'https://your-frontend-url.vercel.app'; // Replace with actual Vercel URL
const SITE_NAME = process.env.SITE_NAME || 'Multi Component Generator';

router.post('/', async (req, res) => {
  const { prompt } = req.body;

  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Prompt must be a non-empty string.' });
  }

  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'OpenRouter API key not configured.' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528:free',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error || 'OpenRouter API error' });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '';

    console.log('🧠 AI Raw Response:', raw);

    // Extract JSX or HTML + CSS
    const jsxMatch = raw.match(/```jsx\s*([\s\S]*?)```/i);
    const htmlMatch = raw.match(/```html\s*([\s\S]*?)```/i);
    const cssMatch = raw.match(/```css\s*([\s\S]*?)```/i);

    let jsx = '';
    let css = cssMatch ? cssMatch[1].trim() : '';

    if (jsxMatch) {
      jsx = jsxMatch[1].trim();
    } else if (htmlMatch) {
      jsx = htmlMatch[1].trim();
    } else {
      const fallback = raw.match(/<[^>]+>[\s\S]*<\/[^>]+>/);
      jsx = fallback ? fallback[0].trim() : `<div>${raw}</div>`;
    }

    res.json({ jsx, css });
  } catch (err) {
    console.error('❌ AI Generation Error:', err.message);
    res.status(500).json({ error: 'AI generation failed. Please try again later.' });
  }
});

module.exports = router;
