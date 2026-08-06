export class TempFileManager {
  private static instance: TempFileManager;
  private objectUrls: Set<string> = new Set();
  private blobReferences: Set<Blob> = new Set();

  private constructor() {}

  static getInstance(): TempFileManager {
    if (!TempFileManager.instance) {
      TempFileManager.instance = new TempFileManager();
    }
    return TempFileManager.instance;
  }

  /**
   * Create an Object URL from Blob/File and register it for auto-cleanup
   */
  createObjectUrl(blobOrFile: Blob | File): string {
    const url = URL.createObjectURL(blobOrFile);
    this.objectUrls.add(url);
    this.blobReferences.add(blobOrFile);
    return url;
  }

  /**
   * Explicitly revoke a registered Object URL
   */
  revokeObjectUrl(url: string): void {
    if (!url) return;
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore URL revocation error
    } finally {
      this.objectUrls.delete(url);
    }
  }

  /**
   * Revoke all managed Object URLs and clear references
   */
  cleanupAll(): void {
    for (const url of Array.from(this.objectUrls)) {
      this.revokeObjectUrl(url);
    }
    this.objectUrls.clear();
    this.blobReferences.clear();
  }

  /**
   * Get active URL count
   */
  getActiveUrlCount(): number {
    return this.objectUrls.size;
  }
}
