export class MemoryManager {
  private static instance: MemoryManager;
  private trackedCanvases: Set<HTMLCanvasElement> = new Set();
  private trackedBuffers: Set<Uint8Array> = new Set();
  private totalAllocatedBytes = 0;

  private constructor() {}

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * Register a canvas for memory tracking and lifecycle cleanup
   */
  registerCanvas(canvas: HTMLCanvasElement): void {
    if (!canvas) return;
    this.trackedCanvases.add(canvas);
    const estBytes = canvas.width * canvas.height * 4;
    this.totalAllocatedBytes += estBytes;
  }

  /**
   * Register a binary Uint8Array buffer
   */
  registerBuffer(buffer: Uint8Array): void {
    if (!buffer) return;
    this.trackedBuffers.add(buffer);
    this.totalAllocatedBytes += buffer.byteLength;
  }

  /**
   * Safely release and wipe canvas 2D contexts and dimensions
   */
  releaseCanvas(canvas: HTMLCanvasElement): void {
    if (!canvas) return;
    try {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      canvas.width = 0;
      canvas.height = 0;
    } catch {
      // Ignore cleanup error
    } finally {
      this.trackedCanvases.delete(canvas);
    }
  }

  /**
   * Release all tracked memory allocations and canvas objects
   */
  purgeAll(): void {
    for (const canvas of Array.from(this.trackedCanvases)) {
      this.releaseCanvas(canvas);
    }
    this.trackedCanvases.clear();
    this.trackedBuffers.clear();
    this.totalAllocatedBytes = 0;
  }

  /**
   * Get estimated memory consumption in Megabytes
   */
  getEstimatedMemoryUsageMb(): number {
    let bytes = this.totalAllocatedBytes;
    for (const canvas of this.trackedCanvases) {
      bytes += canvas.width * canvas.height * 4;
    }
    return Number((bytes / (1024 * 1024)).toFixed(2));
  }
}
