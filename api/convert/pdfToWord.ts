export default async function handler(req: any, res: any) {
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
    // Pluggable server-side PDF to Word converter endpoint
    // In production, LibreOffice / Unoconv / pdf2docx or cloud provider can be invoked here.
    return res.status(501).json({
      error: 'Server-side converter engine is configured in auto mode. Falling back to high-fidelity client-side engine.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Server conversion error' });
  }
}
