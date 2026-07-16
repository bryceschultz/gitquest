import { useEffect, useState } from 'react';
import { ProgressContext, STORAGE_KEY, defaultProgress } from './context';
import { updatedAchievements } from '../game/achievements';
import { coinBalance } from '../game/stats';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultProgress, ...JSON.parse(raw) } : defaultProgress;
  } catch {
    return defaultProgress;
  }
}

// Minimal shape check for imported files: reject anything that would put the
// app into an unusable state. Unknown extra keys are dropped by the merge.
function isValidProgressShape(parsed) {
  return (
    parsed !== null &&
    typeof parsed === 'object' &&
    !Array.isArray(parsed) &&
    (parsed.completedLevels === undefined || Array.isArray(parsed.completedLevels))
  );
}

// Any state transition that can change what's been completed or scored also
// re-evaluates achievements, so badges are always derived from real progress.
function withAchievements(progress) {
  return { ...progress, achievements: updatedAchievements(progress) };
}

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(() => withAchievements(loadFromStorage()));

  // Auto-save to localStorage whenever progress changes.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Storage unavailable (private mode / quota): the session still works,
      // it just won't persist. Nothing actionable to surface mid-battle.
    }
  }, [progress]);

  // Mark a lesson complete and record its assessment score (best score kept).
  function completeLevel(levelId, score) {
    setProgress(prev => {
      const completedLevels = prev.completedLevels.includes(levelId)
        ? prev.completedLevels
        : [...prev.completedLevels, levelId];
      const scores = { ...prev.scores };
      if (typeof score === 'number') {
        scores[levelId] = Math.max(scores[levelId] ?? 0, score);
      }
      return withAchievements({ ...prev, completedLevels, scores });
    });
  }

  function isLevelComplete(levelId) {
    return progress.completedLevels.includes(levelId);
  }

  function setCurrent(missionId, levelId) {
    setProgress(prev => ({ ...prev, currentMission: missionId, currentLevel: levelId }));
  }

  function setMode(mode) {
    setProgress(prev => ({ ...prev, mode }));
  }

  function recordHintUsed() {
    setProgress(prev => ({ ...prev, hintsUsed: (prev.hintsUsed ?? 0) + 1 }));
  }

  function setPlacement(result) {
    setProgress(prev => ({ ...prev, placement: { ...result, date: new Date().toISOString().slice(0, 10) } }));
  }

  // Arsenal purchase. Guarded: no double-purchase, no negative balance.
  function purchaseItem(itemId, cost) {
    let ok = false;
    setProgress(prev => {
      if (prev.inventory.includes(itemId)) return prev;
      if (coinBalance(prev) < cost) return prev;
      ok = true;
      return { ...prev, inventory: [...prev.inventory, itemId], spentCoins: (prev.spentCoins ?? 0) + cost };
    });
    return ok;
  }

  function ownsItem(itemId) {
    return progress.inventory.includes(itemId);
  }

  function resetProgress() {
    setProgress(defaultProgress);
  }

  // Export progress as a downloadable .json file
  function exportProgress() {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gitquest-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import progress from a user-selected .json file
  function importProgress(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          if (!isValidProgressShape(parsed)) {
            reject(new Error('Not a valid GitQuest progress file'));
            return;
          }
          setProgress(withAchievements({ ...defaultProgress, ...parsed }));
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  const value = {
    progress,
    completeLevel,
    isLevelComplete,
    setCurrent,
    setMode,
    recordHintUsed,
    setPlacement,
    purchaseItem,
    ownsItem,
    resetProgress,
    exportProgress,
    importProgress,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}
