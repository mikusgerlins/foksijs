import { useCallback, useEffect, useState } from "react";
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
};

const today = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) => {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
};

const load = (profileId: string): Progress => {
  try {
    const raw = localStorage.getItem(storageKey(profileId));
    if (raw) return { ...defaultProgress, ...JSON.parse(raw) };
    // Migrate legacy single-user progress to first profile (kid-1)
    if (profileId === "kid-1") {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        const parsed = { ...defaultProgress, ...JSON.parse(legacy) };
        localStorage.setItem(storageKey(profileId), JSON.stringify(parsed));
        return parsed;
      }
    }
    return defaultProgress;
  } catch {
    return defaultProgress;
  }
};

const save = (profileId: string, p: Progress) => {
  try {
    localStorage.setItem(storageKey(profileId), JSON.stringify(p));
  } catch {
    // ignore
  }
};

export function useProgress() {
  const { activeId } = useProfiles();
  const [progress, setProgress] = useState<Progress>(() =>
    activeId ? load(activeId) : defaultProgress,
  );

  // Reload progress when active profile changes
  useEffect(() => {
    if (activeId) setProgress(load(activeId));
    else setProgress(defaultProgress);
  }, [activeId]);

  // Persist on change
  useEffect(() => {
    if (activeId) save(activeId, progress);
  }, [activeId, progress]);

  const update = useCallback((fn: (p: Progress) => Progress) => {
    setProgress((prev) => fn(prev));
  }, []);

  const touchStreak = useCallback(() => {
    update((p) => {
      const t = today();
      if (p.lastActive === t) return p;
      let streak = p.streak;
      if (!p.lastActive) streak = 1;
      else {
        const diff = daysBetween(p.lastActive, t);
        if (diff === 1) streak = p.streak + 1;
        else if (diff > 1) streak = 1;
      }
      return { ...p, lastActive: t, streak };
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

  const reset = useCallback(() => {
    setProgress(defaultProgress);
    if (activeId) {
      try {
        localStorage.removeItem(storageKey(activeId));
      } catch {
        // ignore
      }
    }
  }, [activeId]);

  // Read another profile's progress without switching (for parent dashboard)
  const readProfileProgress = useCallback((profileId: string): Progress => {
    return load(profileId);
  }, []);

  const level = Math.floor(progress.xp / 200) + 1;
  const xpInLevel = progress.xp % 200;

  return {
    progress,
    level,
    xpInLevel,
    addXp,
    touchStreak,
    recordMistake,
    recordCorrect,
    completeUnit,
    reset,
    readProfileProgress,
  };
}
