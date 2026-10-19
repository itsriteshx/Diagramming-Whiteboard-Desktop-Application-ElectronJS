const RECENT_FILES_KEY = 'eraserboard_recent_files';
const MAX_RECENT_FILES = 8;

export function getRecentFiles() {
  try {
    const raw = localStorage.getItem(RECENT_FILES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecentFile(filePath, name) {
  if (!filePath) return getRecentFiles();
  try {
    const current = getRecentFiles();
    const displayName = name || filePath.split(/[/\\]/).pop() || 'Untitled Project';
    const filtered = current.filter((item) => item.path !== filePath);
    const updated = [
      {
        path: filePath,
        name: displayName,
        lastOpened: Date.now(),
      },
      ...filtered,
    ].slice(0, MAX_RECENT_FILES);

    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearRecentFiles() {
  try {
    localStorage.removeItem(RECENT_FILES_KEY);
  } catch {
    // Ignore error
  }
  return [];
}
