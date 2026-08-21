import { Request, Response } from 'express';

export default async function wordConvertHandler(req: Request, res: Response): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { title = 'Converted Document', sections = [], text = '' } = req.body || {};

  res.status(200).json({
    status: 'success',
    message: 'Word document structure generated successfully',
    docMetadata: {
      title,
      sectionCount: sections.length || 1,
      charLength: text.length,
    },
  });
}
