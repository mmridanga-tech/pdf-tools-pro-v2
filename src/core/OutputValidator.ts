export interface OutputValidationResult {
  isValid: boolean;
  fileSize: number;
  mimeType: string;
  errors: string[];
}

export class OutputValidator {
  /**
   * Validate generated output Blob before triggering user download
   */
  static async validateOutputBlob(
    blob: Blob,
    expectedType: 'docx' | 'pdf' | 'png' | 'zip'
  ): Promise<OutputValidationResult> {
    const errors: string[] = [];

    if (!blob) {
      return {
        isValid: false,
        fileSize: 0,
        mimeType: '',
        errors: ['Output Blob is null or undefined.'],
      };
    }

    if (blob.size === 0) {
      errors.push('Output Blob is 0 bytes (empty document generated).');
    }

    if (blob.size < 100) {
      errors.push(`Output file size (${blob.size} bytes) is suspiciously small.`);
    }

    // Verify magic bytes header
    try {
      const headerBytes = new Uint8Array(await blob.slice(0, 8).arrayBuffer());
      const isValidHeader = this.checkMagicBytes(headerBytes, expectedType);
      if (!isValidHeader) {
        errors.push(`Output file header bytes do not match expected format for ${expectedType.toUpperCase()}.`);
      }
    } catch {
      errors.push('Failed to read output file header bytes.');
    }

    return {
      isValid: errors.length === 0,
      fileSize: blob.size,
      mimeType: blob.type || 'application/octet-stream',
      errors,
    };
  }

  /**
   * Verify expected magic header bytes
   */
  private static checkMagicBytes(header: Uint8Array, type: 'docx' | 'pdf' | 'png' | 'zip'): boolean {
    if (type === 'docx' || type === 'zip') {
      // PK.. ZIP magic header [0x50, 0x4B, 0x03, 0x04]
      return header.length >= 4 && header[0] === 0x50 && header[1] === 0x4b && header[2] === 0x03 && header[3] === 0x04;
    }
    if (type === 'pdf') {
      // %PDF magic header [0x25, 0x50, 0x44, 0x46]
      return header.length >= 4 && header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46;
    }
    if (type === 'png') {
      // PNG header [0x89, 0x50, 0x4E, 0x47]
      return header.length >= 4 && header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47;
    }
    return true;
  }
}
