import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

export type Profile = {
  id: string;
  name: string;
  avatar: string; // emoji
  color: "primary" | "secondary" | "accent" | "success";
};

const PROFILES_KEY = "rudis-profiles-v1";
const ACTIVE_KEY = "rudis-active-profile-v1";

const defaultProfiles: Profile[] = [
  { id: "kid-1", name: "1. bērns", avatar: "🦊", color: "primary" },
  { id: "kid-2", name: "2. bērns", avatar: "🐻", color: "secondary" },
];

const loadProfiles = (): Profile[] => {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) return defaultProfiles;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return defaultProfiles;
  } catch {
    return defaultProfiles;
  }
};

const loadActive = (): string | null => {
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
};

type Ctx = {
  profiles: Profile[];
  activeId: string | null;
  activeProfile: Profile | null;
  setActive: (id: string | null) => void;
  updateProfile: (id: string, patch: Partial<Profile>) => void;
};

const ProfileContext = createContext<Ctx | null>(null);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profiles, setProfiles] = useState<Profile[]>(() => loadProfiles());
  const [activeId, setActiveId] = useState<string | null>(() => loadActive());

  useEffect(() => {
    try {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    } catch {
      // ignore
    }
  }, [profiles]);

  const setActive = useCallback((id: string | null) => {
    setActiveId(id);
    try {
      if (id) localStorage.setItem(ACTIVE_KEY, id);
      else localStorage.removeItem(ACTIVE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const updateProfile = useCallback((id: string, patch: Partial<Profile>) => {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const activeProfile = profiles.find((p) => p.id === activeId) ?? null;

  return (
    <ProfileContext.Provider
      value={{ profiles, activeId, activeProfile, setActive, updateProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfiles = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfiles must be used inside ProfileProvider");
  return ctx;
};
