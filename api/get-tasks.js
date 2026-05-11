const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DB_ID = process.env.NOTION_DB_ID;

const headers = {
  'Authorization': `Bearer ${NOTION_TOKEN}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ page_size: 100 })
    });

    const data = await response.json();

    const tasks = data.results.map(page => ({
      id: page.properties.TaskId?.rich_text?.[0]?.text?.content || page.id,
      notionId: page.id,
      name: page.properties.Name?.title?.[0]?.text?.content || '',
      done: page.properties.Done?.checkbox || false,
      step: page.properties.Step?.select?.name || 'step0',
      tag: page.properties.Tag?.rich_text?.[0]?.text?.content || 'novo',
    }));

    res.status(200).json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
