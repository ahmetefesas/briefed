export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { sector, style, difficulty, lang } = req.body;

  const langInstruction = lang === 'tr' ? 'Tüm metinleri Türkçe yaz.' : 'Write all text in English.';
  const sectorInstruction = sector === 'random' ? 'Choose a random sector.' : `Sector: ${sector}.`;
  const styleInstruction = style === 'random' ? 'Choose a random visual style.' : `Visual style: ${style}.`;
  const diffInstruction = difficulty === 'random' ? 'Choose a random difficulty level (junior/mid/senior).' : `Difficulty: ${difficulty}.`;

  const prompt = `You are a creative director generating a realistic client brief for a freelance designer. ${langInstruction} ${sectorInstruction} ${styleInstruction} ${diffInstruction}

Return ONLY a valid JSON object, no markdown, no backticks. Structure:
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

Make it feel like a REAL client. Avoid nonsense combinations. Colors must be real hex codes that form a cohesive, aesthetically valid palette matching the visual direction. Make it creatively inspiring.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://briefed.vercel.app',
        'X-Title': 'Briefed'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.choices[0].message.content.replace(/```json|```/g, '').trim();
    const brief = JSON.parse(text);
    res.status(200).json(brief);
  } catch (e) {
    res.status(500).json({ error: 'Brief üretilemedi.' });
  }
}
