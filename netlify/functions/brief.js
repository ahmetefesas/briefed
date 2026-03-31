exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { sector, style, difficulty, lang } = JSON.parse(event.body);

  const langInstruction = lang === 'tr' ? 'Tüm metinleri Türkçe yaz.' : 'Write all text in English.';
  const sectorInstruction = sector === 'random' || sector === 'rastgele' ? 'Choose a random sector.' : `Sector: ${sector}.`;
  const styleInstruction = style === 'random' || style === 'rastgele' ? 'Choose a random visual style.' : `Visual style: ${style}.`;
  const diffInstruction = difficulty === 'random' || difficulty === 'rastgele' ? 'Choose a random difficulty level (junior/mid/senior).' : `Difficulty: ${difficulty}.`;

  const prompt = `You are a creative director generating a realistic client brief for a freelance designer. ${langInstruction} ${sectorInstruction} ${styleInstruction} ${diffInstruction}

Return ONLY a valid JSON object, no markdown, no backticks, no explanation. Structure:
{
  "brandName": "...",
  "industry": "...",
  "personality": ["adj1","adj2","adj3","adj4"],
  "targetAudience": "...",
  "brandValues": "...",
  "colors": ["#HEX1","#HEX2","#HEX3"],
  "typography": "...",
  "visualDirection": "...",
  "symbols": "...",
  "avoid": "...",
  "scope": ["item1","item2","item3"],
  "tone": "...",
  "difficulty": "junior|mid|senior"
}

Make it feel like a REAL client. Colors must be real hex codes. Make it creatively inspiring.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://legendary-jalebi-fdea73.netlify.app',
        'X-Title': 'Briefed'
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return { statusCode: 500, body: JSON.stringify({ error: JSON.stringify(data) }) };
    }

    const text = data.choices[0].message.content.replace(/```json|```/g, '').trim();
    const brief = JSON.parse(text);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(brief) };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
