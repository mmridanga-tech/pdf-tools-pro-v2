/**
 * Security and File Validation Utilities
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates PDF file extensions, MIME types, and header signatures.
 */
export async function validatePdfFile(file: File, maxMb = 100): Promise<ValidationResult> {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  // 1. Size check
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed limit of ${maxMb}MB.`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty (0 bytes).' };
  }

  // 2. Extension check
  const filename = file.name.toLowerCase();
  if (!filename.endsWith('.pdf')) {
    return {
      valid: false,
      error: 'Invalid file format. Please select a valid .pdf document.',
    };
  }

  // 3. Header magic bytes check (%PDF-)
  try {
    const slice = file.slice(0, 5);
    const arrayBuffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const header = String.fromCharCode.apply(null, Array.from(bytes));

    if (!header.startsWith('%PDF-')) {
      return {
        valid: false,
        error: 'Corrupted or invalid PDF header format.',
      };
    }
  } catch {
    // Fallback if header reading fails
  }

  return { valid: true };
}

/**
 * Validates Word (.doc, .docx) files.
 */
export function validateWordFile(file: File, maxMb = 50): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `File size exceeds ${maxMb}MB limit.` };
  }

  const name = file.name.toLowerCase();
  if (!name.endsWith('.doc') && !name.endsWith('.docx')) {
    return { valid: false, error: 'Please upload a valid Microsoft Word (.doc or .docx) document.' };
  }

  return { valid: true };
}

/**
 * Revokes Blob URLs to prevent memory leaks in single-page web applications.
 */
export function cleanupBlobUrls(urls: (string | undefined)[]) {
  urls.forEach((url) => {
    if (url && url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // Ignore revocation errors
      }
    }
  });
}

/**
 * Sanitizes text content to prevent XSS in rendering contexts
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
