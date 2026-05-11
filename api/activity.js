const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_PAGE_ID = process.env.NOTION_PAGE_ID;
const ACTIVITY_DB_ID = process.env.NOTION_ACTIVITY_DB_ID;

const headers = {
  'Authorization': `Bearer ${NOTION_TOKEN}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'POST') {
      const { text } = req.body;
      const dbId = ACTIVITY_DB_ID;

      await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parent: { database_id: dbId },
          properties: {
            Name: { title: [{ text: { content: text } }] },
            Time: { date: { start: new Date().toISOString() } },
          }
        })
      });
      res.status(200).json({ success: true });

    } else {
      const dbId = ACTIVITY_DB_ID;
      const response = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sorts: [{ property: 'Time', direction: 'descending' }],
          page_size: 20
        })
      });
      const data = await response.json();
      const activities = data.results?.map(p => ({
        id: p.id,
        text: p.properties.Name?.title?.[0]?.text?.content || '',
        time: p.properties.Time?.date?.start || p.created_time,
      })) || [];
      res.status(200).json({ success: true, activities });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
