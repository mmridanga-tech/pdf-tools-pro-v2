export type ConversionStage =
  | 'idle'
  | 'validating'
  | 'loading'
  | 'analyzing'
  | 'processing'
  | 'rendering'
  | 'assembling'
  | 'completed'
  | 'error';

export interface ProgressState {
  stage: ConversionStage;
  percentage: number;
  message: string;
  currentPage?: number;
  totalPages?: number;
  elapsedMs: number;
  estimatedRemainingMs?: number;
}

export type ProgressCallback = (state: ProgressState) => void;

export class ProgressTracker {
  private stage: ConversionStage = 'idle';
  private percentage = 0;
  private message = 'Initializing...';
  private currentPage = 0;
  private totalPages = 0;
  private startTime = 0;
  private callback?: ProgressCallback;

  constructor(callback?: ProgressCallback) {
    this.callback = callback;
    this.startTime = Date.now();
  }

  start(totalPageCount = 1) {
    this.startTime = Date.now();
    this.totalPages = totalPageCount;
    this.update('loading', 5, 'Starting document conversion pipeline...');
  }

  update(stage: ConversionStage, percentage: number, message: string, currentPage?: number) {
    this.stage = stage;
    this.percentage = Math.min(100, Math.max(0, percentage));
    this.message = message;
    if (currentPage !== undefined) {
      this.currentPage = currentPage;
    }

    const elapsedMs = Date.now() - this.startTime;
    let estimatedRemainingMs: number | undefined = undefined;

    if (this.percentage > 5 && this.percentage < 100) {
      const estimatedTotal = (elapsedMs / this.percentage) * 100;
      estimatedRemainingMs = Math.max(0, Math.round(estimatedTotal - elapsedMs));
    }

    if (this.callback) {
      this.callback({
        stage: this.stage,
        percentage: this.percentage,
        message: this.message,
        currentPage: this.currentPage,
        totalPages: this.totalPages,
        elapsedMs,
        estimatedRemainingMs,
      });
    }
  }

  complete(message = 'Conversion completed successfully!') {
    this.update('completed', 100, message);
  }

  fail(errorMessage: string) {
    this.update('error', this.percentage, errorMessage);
  }

  getState(): ProgressState {
    const elapsedMs = Date.now() - this.startTime;
    return {
      stage: this.stage,
      percentage: this.percentage,
      message: this.message,
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      elapsedMs,
    };
  }
}
