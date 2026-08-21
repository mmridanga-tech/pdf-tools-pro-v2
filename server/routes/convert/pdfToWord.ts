import { Request, Response } from 'express';

export default async function pdfToWordHandler(req: Request, res: Response): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { filename = 'converted.docx', pages = 1 } = req.body || {};

  res.status(200).json({
    status: 'ready',
    filename,
    pages,
    downloadReady: true,
  });
}
