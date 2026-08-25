/**
 * Utility for persisting and retrieving recently processed files (PDFs, photos, documents)
 * Stores the last 5 files in localStorage with direct 1-click re-download capability.
 */

export interface RecentFileItem {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'document';
  category: string; // e.g. "PDF Merge", "Optimized Photo", "Passport Grid", "Cash Memo"
  sizeLabel?: string; // e.g. "45 KB", "1.2 MB"
  timestamp: number;
  downloadUrl: string; // Data URL or object URL
  previewUrl?: string; // Small thumbnail preview
}

const STORAGE_KEY = 'csc_recent_processed_files_v1';
const MAX_RECENT_FILES = 5;
export const RECENT_ACTIVITY_EVENT = 'csc_recent_activity_updated';

/**
 * Get all recent processed items (max 5)
 */
export function getRecentActivities(): RecentFileItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, MAX_RECENT_FILES);
    }
  } catch (err) {
    console.warn('Failed to load recent activities from localStorage:', err);
  }
  return [];
}

/**
 * Register a newly processed file into recent activities
 */
export function addRecentActivity(
  item: Omit<RecentFileItem, 'id' | 'timestamp'> & { id?: string; timestamp?: number }
): void {
  try {
    const current = getRecentActivities();
    
    // Create new record
    const newRecord: RecentFileItem = {
      id: item.id || `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: item.name,
      type: item.type,
      category: item.category,
      sizeLabel: item.sizeLabel || 'Ready',
      timestamp: item.timestamp || Date.now(),
      downloadUrl: item.downloadUrl,
      previewUrl: item.previewUrl || (item.type === 'image' ? item.downloadUrl : undefined)
    };

    // Filter out duplicate identical filenames and prepend new item
    const filtered = current.filter(existing => existing.name !== item.name && existing.id !== newRecord.id);
    const updated = [newRecord, ...filtered].slice(0, MAX_RECENT_FILES);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (quotaError) {
      console.warn('LocalStorage quota exceeded when storing downloadUrl, saving lightweight entry:', quotaError);
      // If dataUrl was too large, store without preview thumbnail to preserve memory
      const lightweight = updated.map(f => ({
        ...f,
        previewUrl: undefined,
        downloadUrl: f.downloadUrl.length > 500000 ? '' : f.downloadUrl
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight));
    }

    // Broadcast update event so sidebar updates in real time
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(RECENT_ACTIVITY_EVENT, { detail: newRecord }));
    }
  } catch (err) {
    console.error('Error adding recent activity:', err);
  }
}

/**
 * Delete a specific recent activity item
 */
export function deleteRecentActivity(id: string): void {
  try {
    const current = getRecentActivities();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(RECENT_ACTIVITY_EVENT));
    }
  } catch (err) {
    console.error('Error deleting recent activity:', err);
  }
}

/**
 * Clear all recent activities
 */
export function clearRecentActivities(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(RECENT_ACTIVITY_EVENT));
    }
  } catch (err) {
    console.error('Error clearing recent activities:', err);
  }
}

/**
 * Trigger browser file download for a recent item
 */
export function triggerFileDownload(item: RecentFileItem): void {
  if (!item.downloadUrl) {
    alert('File download URL has expired from session memory. Please re-generate the file in the studio.');
    return;
  }

  const link = document.createElement('a');
  link.href = item.downloadUrl;
  link.download = item.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format timestamp into relative or time string
 */
export function formatTimeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 45) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
