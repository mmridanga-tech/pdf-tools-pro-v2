import { Request, Response } from 'express';

export default async function compressHandler(req: Request, res: Response): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { filename = 'document.pdf', originalSizeBytes = 1000000, targetCompression = 'balanced' } = req.body || {};

  const reductionRatio = targetCompression === 'high' ? 0.45 : targetCompression === 'low' ? 0.8 : 0.6;
  const estimatedSizeBytes = Math.round(originalSizeBytes * reductionRatio);

  res.status(200).json({
    status: 'success',
    filename,
    originalSizeBytes,
    estimatedSizeBytes,
    savingsPercent: Math.round((1 - reductionRatio) * 100),
  });
}
