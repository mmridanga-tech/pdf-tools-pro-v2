import { ProgressTracker, ProgressState } from './ProgressTracker';
import { ConversionError } from './ErrorHandler';

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface ConversionJob {
  id: string;
  file: File;
  targetFormat: string;
  status: JobStatus;
  progress: ProgressState;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  resultBlob?: Blob;
  error?: ConversionError;
  cancelToken: { isCancelled: boolean };
}

export class JobManager {
  private static instance: JobManager;
  private jobs: Map<string, ConversionJob> = new Map();
  private maxConcurrentJobs = 3;
  private activeJobsCount = 0;

  private constructor() {}

  static getInstance(): JobManager {
    if (!JobManager.instance) {
      JobManager.instance = new JobManager();
    }
    return JobManager.instance;
  }

  /**
   * Create and register a new conversion job
   */
  createJob(file: File, targetFormat: string): ConversionJob {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const tracker = new ProgressTracker();

    const job: ConversionJob = {
      id: jobId,
      file,
      targetFormat,
      status: 'queued',
      progress: tracker.getState(),
      createdAt: new Date(),
      cancelToken: { isCancelled: false },
    };

    this.jobs.set(jobId, job);
    return job;
  }

  /**
   * Get a job by ID
   */
  getJob(jobId: string): ConversionJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Mark job as processing
   */
  markProcessing(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'processing';
      job.startedAt = new Date();
      this.activeJobsCount++;
    }
  }

  /**
   * Complete job with result Blob
   */
  markCompleted(jobId: string, resultBlob: Blob): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'completed';
      job.completedAt = new Date();
      job.resultBlob = resultBlob;
      if (this.activeJobsCount > 0) this.activeJobsCount--;
    }
  }

  /**
   * Mark job as failed
   */
  markFailed(jobId: string, error: ConversionError): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'failed';
      job.completedAt = new Date();
      job.error = error;
      if (this.activeJobsCount > 0) this.activeJobsCount--;
    }
  }

  /**
   * Request cancellation of a job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (job && (job.status === 'queued' || job.status === 'processing')) {
      job.status = 'cancelled';
      job.cancelToken.isCancelled = true;
      if (this.activeJobsCount > 0) this.activeJobsCount--;
      return true;
    }
    return false;
  }

  /**
   * Get all jobs
   */
  getAllJobs(): ConversionJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Remove old or completed jobs
   */
  clearCompletedJobs(): void {
    for (const [id, job] of this.jobs.entries()) {
      if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
        this.jobs.delete(id);
      }
    }
  }
}
