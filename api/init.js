const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_PAGE_ID = process.env.NOTION_PAGE_ID;

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
    // Criar database no Notion para tasks
    const response = await fetch('https://api.notion.com/v1/databases', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        parent: { type: 'page_id', page_id: NOTION_PAGE_ID },
        title: [{ type: 'text', text: { content: 'SIP Tasks' } }],
        properties: {
          Name: { title: {} },
          Done: { checkbox: {} },
          Step: { select: { options: [
            { name: 'step0', color: 'blue' },
            { name: 'step1', color: 'green' },
            { name: 'step2', color: 'yellow' },
            { name: 'step3', color: 'orange' },
            { name: 'step4', color: 'red' },
            { name: 'step5', color: 'purple' },
            { name: 'step6', color: 'pink' },
            { name: 'step7', color: 'gray' },
          ]}},
          Tag: { rich_text: {} },
          TaskId: { rich_text: {} },
        }
      })
    });

    const data = await response.json();
    if (data.id) {
      res.status(200).json({ success: true, database_id: data.id });
    } else {
      res.status(400).json({ success: false, error: data });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
