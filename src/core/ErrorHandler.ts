export type ConversionErrorCode =
  | 'FILE_INVALID'
  | 'FILE_TOO_LARGE'
  | 'FILE_CORRUPTED'
  | 'PASSWORD_PROTECTED'
  | 'PARSING_FAILED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'TIMEOUT_EXCEEDED'
  | 'SERVER_UNAVAILABLE'
  | 'NETWORK_ERROR'
  | 'OUTPUT_VALIDATION_FAILED'
  | 'OCR_FAILED'
  | 'UNKNOWN_ERROR';

export interface StandardizedError {
  code: ConversionErrorCode;
  message: string;
  userMessage: string;
  isRecoverable: boolean;
  originalError?: any;
  timestamp: string;
}

export class ConversionError extends Error {
  code: ConversionErrorCode;
  userMessage: string;
  isRecoverable: boolean;
  originalError?: any;
  timestamp: string;

  constructor(
    code: ConversionErrorCode,
    message: string,
    userMessage?: string,
    isRecoverable = false,
    originalError?: any
  ) {
    super(message);
    this.name = 'ConversionError';
    this.code = code;
    this.userMessage = userMessage || ErrorHandler.getDefaultUserMessage(code);
    this.isRecoverable = isRecoverable;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

export class ErrorHandler {
  /**
   * Wrap any error into a standardized ConversionError
   */
  static handle(error: any, defaultCode: ConversionErrorCode = 'UNKNOWN_ERROR'): ConversionError {
    if (error instanceof ConversionError) {
      return error;
    }

    const errStr = String(error?.message || error || '').toLowerCase();

    if (errStr.includes('password') || errStr.includes('encrypted')) {
      return new ConversionError('PASSWORD_PROTECTED', 'Document is encrypted or password protected.', undefined, false, error);
    }

    if (errStr.includes('invalid pdf') || errStr.includes('corrupt') || errStr.includes('header')) {
      return new ConversionError('FILE_CORRUPTED', 'The file structure appears to be corrupted or invalid.', undefined, false, error);
    }

    if (errStr.includes('memory') || errStr.includes('out of memory') || errStr.includes('allocation')) {
      return new ConversionError('MEMORY_LIMIT_EXCEEDED', 'Document processing exceeded browser memory limits.', undefined, true, error);
    }

    if (errStr.includes('timeout') || errStr.includes('timed out')) {
      return new ConversionError('TIMEOUT_EXCEEDED', 'Conversion timed out before finishing.', undefined, true, error);
    }

    if (errStr.includes('fetch') || errStr.includes('network') || errStr.includes('failed to fetch')) {
      return new ConversionError('NETWORK_ERROR', 'Network connection error during server engine call.', undefined, true, error);
    }

    return new ConversionError(defaultCode, error?.message || 'An unexpected conversion error occurred.', undefined, false, error);
  }

  /**
   * Get user-friendly, localized error messages for each code
   */
  static getDefaultUserMessage(code: ConversionErrorCode): string {
    switch (code) {
      case 'FILE_INVALID':
        return 'The selected file format is not supported or is invalid.';
      case 'FILE_TOO_LARGE':
        return 'The file size exceeds the allowed processing limit.';
      case 'FILE_CORRUPTED':
        return 'This file appears to be corrupted and cannot be parsed.';
      case 'PASSWORD_PROTECTED':
        return 'This PDF is password-protected. Please unlock it before converting.';
      case 'PARSING_FAILED':
        return 'Unable to extract text and elements from this document.';
      case 'MEMORY_LIMIT_EXCEEDED':
        return 'Memory limit reached. Try processing fewer pages at a time.';
      case 'TIMEOUT_EXCEEDED':
        return 'The conversion took too long and was aborted. Please try again.';
      case 'SERVER_UNAVAILABLE':
        return 'The conversion server is currently unreachable. Switching to offline engine.';
      case 'NETWORK_ERROR':
        return 'Network connection issue. Please check your internet connection.';
      case 'OUTPUT_VALIDATION_FAILED':
        return 'The generated file failed validation tests.';
      case 'OCR_FAILED':
        return 'Optical Character Recognition could not read scanned pages.';
      default:
        return 'An error occurred during document conversion. Please try again.';
    }
  }
}
