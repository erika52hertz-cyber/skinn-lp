export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { answers } = req.body;

  const prompt = `あなたはスキンケアの専門家です。以下の肌診断アンケートの回答をもとに、パーソナライズされた美容液の処方提案を日本語で作成してください。

【診断回答】
${answers.map(a => `・${a.question}\n　→ ${a.answer}`).join('\n')}

以下の形式でJSONのみを返してください（他の文章は不要）：
{
  "skin_type": "肌タイプ名（例：乾燥敏感肌）",
  "diagnosis": "肌状態の診断コメント（2〜3文）",
  "prescription": "処方の説明と期待できる効果（3〜4文）",
  "ingredients": ["成分1", "成分2", "成分3", "成分4"]
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: 'API error' });
  }
}
