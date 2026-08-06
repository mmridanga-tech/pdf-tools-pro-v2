export interface ValidationResult {
  isValid: boolean;
  fileSize: number;
  mimeType: string;
  errors: string[];
  warnings: string[];
}

export interface ValidationOptions {
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  checkHeaderBytes?: boolean;
}

export class FileValidator {
  private static DEFAULT_MAX_SIZE = 100 * 1024 * 1024; // 100 MB

  private static MAGIC_NUMBERS: Record<string, number[][]> = {
    pdf: [[0x25, 0x50, 0x44, 0x46]], // %PDF
    png: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
    jpeg: [
      [0xff, 0xd8, 0xff, 0xe0],
      [0xff, 0xd8, 0xff, 0xe1],
    ],
    docx: [[0x50, 0x4b, 0x03, 0x04]], // PK.. (ZIP container)
  };

  /**
   * Validate a file against type, size, and magic byte header rules.
   */
  static async validateFile(
    file: File,
    options: ValidationOptions = {}
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const maxSizeBytes = options.maxSizeBytes || this.DEFAULT_MAX_SIZE;

    if (!file) {
      return {
        isValid: false,
        fileSize: 0,
        mimeType: '',
        errors: ['No file provided for conversion.'],
        warnings: [],
      };
    }

    if (file.size === 0) {
      errors.push('File is empty (0 bytes).');
    }

    if (file.size > maxSizeBytes) {
      const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(1);
      errors.push(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum limit of ${maxMb} MB.`);
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (options.allowedExtensions && options.allowedExtensions.length > 0) {
      const isExtAllowed = options.allowedExtensions.some(
        (e) => e.toLowerCase() === ext || `.${e.toLowerCase()}` === `.${ext}`
      );
      if (!isExtAllowed) {
        errors.push(`Extension '.${ext}' is not supported. Allowed: ${options.allowedExtensions.join(', ')}`);
      }
    }

    if (options.allowedMimeTypes && options.allowedMimeTypes.length > 0 && file.type) {
      const isMimeAllowed = options.allowedMimeTypes.some(
        (m) => m.toLowerCase() === file.type.toLowerCase() || m === '*/*'
      );
      if (!isMimeAllowed) {
        warnings.push(`File MIME type '${file.type}' differs from standard expected MIME types.`);
      }
    }

    if (options.checkHeaderBytes !== false && file.size >= 4) {
      try {
        const headerBytes = await this.readFileHeaderBytes(file, 8);
        const headerValid = this.verifyMagicHeader(ext, headerBytes);
        if (!headerValid) {
          warnings.push(`File magic bytes do not strictly match expected signature for .${ext} extension.`);
        }
      } catch (err) {
        warnings.push('Could not verify file magic header bytes.');
      }
    }

    return {
      isValid: errors.length === 0,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
      errors,
      warnings,
    };
  }

  /**
   * Helper: Read initial bytes of a file
   */
  private static async readFileHeaderBytes(file: File, byteCount: number): Promise<Uint8Array> {
    const slice = file.slice(0, byteCount);
    const buffer = await slice.arrayBuffer();
    return new Uint8Array(buffer);
  }

  /**
   * Helper: Verify magic header signature
   */
  private static verifyMagicHeader(ext: string, header: Uint8Array): boolean {
    const signatures = this.MAGIC_NUMBERS[ext];
    if (!signatures) return true; // If signature unknown, skip header validation

    return signatures.some((sig) => {
      if (header.length < sig.length) return false;
      return sig.every((byte, idx) => header[idx] === byte);
    });
  }
}
