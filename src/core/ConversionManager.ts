import { FileValidator, ValidationResult } from './FileValidator';
import { OutputValidator, OutputValidationResult } from './OutputValidator';
import { ProgressTracker, ProgressCallback } from './ProgressTracker';
import { ConversionLogger } from './ConversionLogger';
import { ConversionError, ErrorHandler } from './ErrorHandler';
import { MemoryManager } from './MemoryManager';
import { TempFileManager } from './TempFileManager';
import { JobManager, ConversionJob } from './JobManager';
import { ConversionConfigManager, EngineConfig } from './ConversionConfig';

export interface ConversionHandlerOptions {
  engineMode?: 'client' | 'server' | 'auto';
  onProgress?: ProgressCallback;
  enableOcr?: boolean;
}

export type ConverterFn = (
  file: File,
  tracker: ProgressTracker,
  logger: ConversionLogger,
  options?: ConversionHandlerOptions
) => Promise<Blob>;

export class ConversionManager {
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

  /**
   * Execute a document conversion workflow safely through validation, execution, memory tracking and output verification
   */
  async executeConversion(
    file: File,
    targetFormat: 'docx' | 'pdf' | 'png' | 'zip',
    converterFn: ConverterFn,
    options: ConversionHandlerOptions = {}
  ): Promise<Blob> {
    const config = this.configManager.getConfig();
    const tracker = new ProgressTracker(options.onProgress);
    const job = this.jobManager.createJob(file, targetFormat);

    this.logger.startTimer(`Conversion_${job.id}`);
    this.logger.info(`Starting conversion job ${job.id} for file: ${file.name}`);

    try {
      // Step 1: Validate Input File
      tracker.update('validating', 5, 'Validating file format and size limits...');
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

      // Step 2: Mark Processing
      this.jobManager.markProcessing(job.id);
      tracker.update('processing', 15, 'Preparing document conversion engine...');

      // Step 3: Run Conversion Strategy
      const outputBlob = await converterFn(file, tracker, this.logger, options);

      // Step 4: Validate Output Blob
      tracker.update('assembling', 90, 'Verifying generated output document structure...');
      const outputValidation: OutputValidationResult = await OutputValidator.validateOutputBlob(
        outputBlob,
        targetFormat
      );

      if (!outputValidation.isValid) {
        throw new ConversionError(
          'OUTPUT_VALIDATION_FAILED',
          outputValidation.errors.join(' '),
          'The generated file is invalid or empty. Please try again.'
        );
      }

      // Step 5: Complete
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
