import { FileValidator, ValidationResult } from './FileValidator';
import { OutputValidator, OutputValidationResult } from './OutputValidator';
import { ProgressTracker, ProgressCallback } from './ProgressTracker';
import { ConversionLogger } from './ConversionLogger';
import { ConversionError, ErrorHandler } from './ErrorHandler';
import { MemoryManager } from './MemoryManager';
import { TempFileManager } from './TempFileManager';
import { JobManager, ConversionJob } from './JobManager';
import { ConversionConfigManager, EngineConfig } from './ConversionConfig';

export type TargetFormat =
  | 'docx'
  | 'pdf'
  | 'png'
  | 'jpg'
  | 'xlsx'
  | 'pptx'
  | 'zip'
  | 'json'
  | 'txt'
  | string;

export interface ConversionHandlerOptions {
  engineMode?: 'client' | 'server' | 'auto';
  onProgress?: ProgressCallback | ((percent: number, statusMsg?: string) => void);
  enableOcr?: boolean;
  timeoutMs?: number;
  retryCount?: number;
  signal?: AbortSignal;
  [key: string]: any;
}

export type ConverterFn = (
  file: File,
  tracker: ProgressTracker,
  logger: ConversionLogger,
  options?: ConversionHandlerOptions
) => Promise<Blob>;

export class ConversionManager {
  private static instance: ConversionManager;
  private configManager: ConversionConfigManager;
  private jobManager: JobManager;
  private memoryManager: MemoryManager;
  private tempFileManager: TempFileManager;
  private logger: ConversionLogger;

  constructor(
    configManager = ConversionConfigManager.getInstance(),
    jobManager = JobManager.getInstance(),
    memoryManager = MemoryManager.getInstance(),
    tempFileManager = TempFileManager.getInstance(),
    logger = new ConversionLogger('ConversionManager')
  ) {
    this.configManager = configManager;
    this.jobManager = jobManager;
    this.memoryManager = memoryManager;
    this.tempFileManager = tempFileManager;
    this.logger = logger;
  }

  static getInstance(): ConversionManager {
    if (!ConversionManager.instance) {
      ConversionManager.instance = new ConversionManager();
    }
    return ConversionManager.instance;
  }

  /**
   * Execute a document conversion workflow safely through validation, execution, memory tracking and output verification
   */
  async executeConversion(
    fileInput: File | File[],
    targetFormat: TargetFormat,
    converterFn: ConverterFn,
    options: ConversionHandlerOptions = {}
  ): Promise<Blob> {
    const config = this.configManager.getConfig();
    const primaryFile = Array.isArray(fileInput) ? fileInput[0] : fileInput;

    if (!primaryFile) {
      throw new ConversionError('FILE_INVALID', 'No file provided for conversion.');
    }

    // Bridge progress callback
    const userProgress = options.onProgress;
    const progressBridge: ProgressCallback = (state) => {
      if (userProgress) {
        if (typeof userProgress === 'function') {
          try {
            (userProgress as any)(state);
            (userProgress as any)(state.percentage, state.message);
          } catch {
            // Ignore progress callback exception
          }
        }
      }
    };

    const tracker = new ProgressTracker(progressBridge);
    const job: ConversionJob = this.jobManager.createJob(primaryFile, targetFormat);

    const timeoutMs = options.timeoutMs || config.conversionTimeoutMs || 120000;
    const maxRetries = options.retryCount !== undefined ? options.retryCount : 1;

    this.logger.startTimer(`Conversion_${job.id}`);
    this.logger.info(
      `Starting conversion job ${job.id} [Format: ${targetFormat}] for file: ${primaryFile.name}`
    );

    try {
      // Step 1: Validate Input File(s)
      tracker.update('validating', 5, 'Validating file format and size limits...');

      const filesToValidate = Array.isArray(fileInput) ? fileInput : [fileInput];
      for (const file of filesToValidate) {
        const validation: ValidationResult = await FileValidator.validateFile(file, {
          maxSizeBytes: config.maxFileSizeBytes,
        });

        if (!validation.isValid) {
          throw new ConversionError(
            'FILE_INVALID',
            validation.errors.join(' '),
            validation.errors[0]
          );
        }
      }

      // Step 2: Mark Processing
      this.jobManager.markProcessing(job.id);
      tracker.update('processing', 15, 'Preparing document conversion engine...');

      // Step 3: Run Conversion with Timeout, Retry, and Cancellation Support
      let attempt = 0;
      let outputBlob: Blob | null = null;
      let lastError: any = null;

      while (attempt <= maxRetries && !outputBlob) {
        attempt++;
        if (attempt > 1) {
          this.logger.warn(`Retrying conversion job ${job.id} (Attempt ${attempt}/${maxRetries + 1})...`);
          tracker.update('processing', 20, `Retrying conversion (Attempt ${attempt})...`);
        }

        try {
          // Check cancellation
          if (job.cancelToken.isCancelled || options.signal?.aborted) {
            throw new ConversionError('UNKNOWN_ERROR', 'Conversion was cancelled by user.');
          }

          // Execute conversion with timeout race
          outputBlob = await Promise.race([
            converterFn(primaryFile, tracker, this.logger, options),
            new Promise<never>((_, reject) => {
              setTimeout(() => {
                reject(
                  new ConversionError(
                    'TIMEOUT_EXCEEDED',
                    `Conversion timed out after ${timeoutMs / 1000} seconds.`
                  )
                );
              }, timeoutMs);
            }),
          ]);
        } catch (err) {
          lastError = err;
          const convErr = ErrorHandler.handle(err);
          if (!convErr.isRecoverable || attempt > maxRetries) {
            throw convErr;
          }
        }
      }

      if (!outputBlob) {
        throw ErrorHandler.handle(lastError || new Error('Conversion produced no output blob.'));
      }

      // Step 4: Validate Output Blob
      tracker.update('assembling', 90, 'Verifying generated output document structure...');
      const outputValidation: OutputValidationResult = await OutputValidator.validateOutputBlob(
        outputBlob,
        targetFormat as any
      );

      if (!outputValidation.isValid) {
        throw new ConversionError(
          'OUTPUT_VALIDATION_FAILED',
          outputValidation.errors.join(' '),
          'The generated file is invalid or empty. Please try again.'
        );
      }

      // Register generated Object URL in TempFileManager for auto-cleanup
      this.tempFileManager.createObjectUrl(outputBlob);

      // Step 5: Complete Job
      tracker.complete('Conversion completed successfully!');
      this.jobManager.markCompleted(job.id, outputBlob);
      this.logger.endTimer(`Conversion_${job.id}`);

      return outputBlob;
    } catch (err) {
      const convError = ErrorHandler.handle(err);
      this.logger.error(`Conversion job ${job.id} failed: ${convError.message}`, convError);
      tracker.fail(convError.userMessage);
      this.jobManager.markFailed(job.id, convError);
      throw convError;
    } finally {
      // Resource Memory and Object URL Cleanup
      this.memoryManager.purgeAll();
    }
  }

  /**
   * Get Current Config
   */
  getConfig(): Readonly<EngineConfig> {
    return this.configManager.getConfig();
  }

  /**
   * Get Active Logger
   */
  getLogger(): ConversionLogger {
    return this.logger;
  }
}
