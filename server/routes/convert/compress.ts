export default async function compressHandler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Please use POST.' });
  }

  try {
    return res.status(501).json({
      error: 'Server-side optimizer engine in auto mode. Falling back to high-fidelity client-side compression engine.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Server compression error' });
  }
}
