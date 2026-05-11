const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DB_ID = process.env.NOTION_DB_ID;

const headers = {
  'Authorization': `Bearer ${NOTION_TOKEN}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, task } = req.body;

  try {
    if (action === 'create') {
      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parent: { database_id: DB_ID },
          properties: {
            Name: { title: [{ text: { content: task.name } }] },
            Done: { checkbox: task.done || false },
            Step: { select: { name: task.step } },
            Tag: { rich_text: [{ text: { content: task.tag || 'novo' } }] },
            TaskId: { rich_text: [{ text: { content: task.id } }] },
          }
        })
      });
      const data = await response.json();
      res.status(200).json({ success: true, notionId: data.id });

    } else if (action === 'update') {
      await fetch(`https://api.notion.com/v1/pages/${task.notionId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          properties: {
            Done: { checkbox: task.done },
          }
        })
      });
      res.status(200).json({ success: true });

    } else if (action === 'delete') {
      await fetch(`https://api.notion.com/v1/pages/${task.notionId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ archived: true })
      });
      res.status(200).json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
