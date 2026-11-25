import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useProfiles } from "@/contexts/ProfileContext";

export type UnitProgress = {
  stars: number;
  completed: boolean;
  bestMistakes: number;
};

export type Progress = {
  xp: number;
  streak: number;
  lastActive: string | null;
  units: Record<string, UnitProgress>;
  learnedWords: string[];
  mistakes: Record<string, number>;
  cafeStep: 0 | 1 | 2 | null;
  cafeWaterChosen: boolean;
  cafeCompletedCount: number;
  cafePracticeDays: string[];
};

const storageKey = (profileId: string) => `rudis-progress-v2-${profileId}`;
const LEGACY_KEY = "rudis-progress-v1";

const defaultProgress: Progress = {
  xp: 0,
  streak: 0,
  lastActive: null,
  units: {},
  learnedWords: [],
  mistakes: {},
  cafeStep: null,
  cafeWaterChosen: false,
  cafeCompletedCount: 0,
  cafePracticeDays: [],
};

const localDate = (date: Date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, "0"),
  String(date.getDate()).padStart(2, "0"),
].join("-");

function creditDay(p: Progress, date: Date): Progress {
  const today = localDate(date);
  if (p.lastActive && p.lastActive >= today) return p;
  const yesterday = new Date(date);
  yesterday.setDate(date.getDate() - 1);
  return {
    ...p,
    lastActive: today,
    streak: p.lastActive === localDate(yesterday) ? p.streak + 1 : 1,
  };
}

// Keep all mounted consumers on one snapshot, including the navigation bar.
// Save synchronously so closing the app just after a tap preserves that step.
const listeners = new Set<() => void>();
const unsaved = new Map<string, string>();
function subscribe(notify: () => void) {
  listeners.add(notify);
  window.addEventListener("storage", notify);
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", notify);
  };
}

function snapshot(profileId: string | null): string | null {
  if (!profileId) return null;
  const key = storageKey(profileId);
  if (unsaved.has(key)) return unsaved.get(key)!;
  try {
    return localStorage.getItem(key) ?? (profileId === "kid-1" ? localStorage.getItem(LEGACY_KEY) : null);
  } catch {
    return null;
  }
}

function decode(raw: string | null): Progress {
  try {
    return raw ? { ...defaultProgress, ...JSON.parse(raw) } : defaultProgress;
  } catch {
    return defaultProgress;
  }
}

const save = (profileId: string, p: Progress) => {
  const key = storageKey(profileId);
  const raw = JSON.stringify(p);
  try {
    localStorage.setItem(key, raw);
    unsaved.delete(key);
  } catch {
    unsaved.set(key, raw);
  }
  listeners.forEach(notify => notify());
};

export function useProgress() {
  const { activeId } = useProfiles();
  const raw = useSyncExternalStore(subscribe, () => snapshot(activeId));
  const progress = useMemo(() => decode(raw), [raw]);

  const update = useCallback((fn: (p: Progress) => Progress) => {
    if (!activeId) return;
    const previous = decode(snapshot(activeId));
    const next = fn(previous);
    if (next !== previous) save(activeId, next);
  }, [activeId]);

  const touchStreak = useCallback(() => {
    update(p => creditDay(p, new Date()));
  }, [update]);

  const setCafeStep = useCallback((step: Progress["cafeStep"]) => {
    update(p => ({ ...p, cafeStep: step, cafeWaterChosen: false }));
  }, [update]);

  const setCafeWaterChosen = useCallback(() => {
    update(p => p.cafeStep === 0 ? { ...p, cafeWaterChosen: true } : p);
  }, [update]);

  const finishCafe = useCallback(() => {
    update(p => {
      if (p.cafeStep !== 2) return p;
      const date = new Date();
      const day = localDate(date);
      return {
        ...creditDay(p, date),
        cafeStep: null,
        cafeWaterChosen: false,
        cafeCompletedCount: p.cafeCompletedCount + 1,
        cafePracticeDays: p.cafePracticeDays.includes(day) ? p.cafePracticeDays : [...p.cafePracticeDays, day],
      };
    });
  }, [update]);

  const addXp = useCallback((amount: number) => {
    update((p) => ({ ...p, xp: p.xp + amount }));
  }, [update]);

  const recordMistake = useCallback((wordEn: string) => {
    update((p) => ({
      ...p,
      mistakes: { ...p.mistakes, [wordEn]: (p.mistakes[wordEn] || 0) + 1 },
    }));
  }, [update]);

  const recordCorrect = useCallback((wordEn: string) => {
    update((p) => {
      const learned = p.learnedWords.includes(wordEn)
        ? p.learnedWords
        : [...p.learnedWords, wordEn];
      return { ...p, learnedWords: learned };
    });
  }, [update]);

  const completeUnit = useCallback((unitId: string, mistakes: number) => {
    update((p) => {
      const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
      const prev = p.units[unitId];
      const bestMistakes = prev ? Math.min(prev.bestMistakes, mistakes) : mistakes;
      const bestStars = Math.max(prev?.stars || 0, stars);
      return {
        ...p,
        units: {
          ...p.units,
          [unitId]: { stars: bestStars, completed: true, bestMistakes },
        },
      };
    });
  }, [update]);

  const resetProfileProgress = useCallback((profileId: string) => save(profileId, defaultProgress), []);
  const reset = useCallback(() => {
    if (activeId) resetProfileProgress(activeId);
  }, [activeId, resetProfileProgress]);

  // Read another profile's progress without switching (for parent dashboard)
  const readProfileProgress = useCallback((profileId: string): Progress => {
    return decode(snapshot(profileId));
  }, []);

  const level = Math.floor(progress.xp / 200) + 1;
  const xpInLevel = progress.xp % 200;

  return {
    progress,
    level,
    xpInLevel,
    addXp,
    touchStreak,
    setCafeStep,
    setCafeWaterChosen,
    finishCafe,
    recordMistake,
    recordCorrect,
    completeUnit,
    reset,
    readProfileProgress,
    resetProfileProgress,
  };
}
