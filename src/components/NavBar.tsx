import { NavLink, useNavigate } from "react-router-dom";
import { Home, Map, Users, Repeat, Star, Flame, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgress } from "@/hooks/useProgress";
import { useProfiles } from "@/contexts/ProfileContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const items = [
  { to: "/", label: "Sākums", icon: Home, end: true },
  { to: "/macibas", label: "Mācības", icon: Map },
  { to: "/atkartot", label: "Atkārtot", icon: Repeat },
  { to: "/vecakiem", label: "Vecākiem", icon: Users },
];

export const NavBar = () => {
  const { progress, level } = useProgress();
  const { profiles, activeProfile, setActive } = useProfiles();
  const navigate = useNavigate();

  const switchProfile = (id: string) => {
    setActive(id);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-2 sm:gap-4">
        {/* Profile switcher (replaces logo) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-muted transition-colors shrink-0">
              <span className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-2xl shadow-card">
                {activeProfile?.avatar ?? "🦊"}
              </span>
              <span className="font-extrabold text-sm sm:text-base hidden sm:inline">
                {activeProfile?.name ?? "Foksijs"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="rounded-2xl">
            <DropdownMenuLabel>Profili</DropdownMenuLabel>
            {profiles.map((p) => (
              <DropdownMenuItem
                key={p.id}
                onClick={() => switchProfile(p.id)}
                className="rounded-xl gap-2 cursor-pointer font-bold"
              >
                <span className="text-xl">{p.avatar}</span>
                <span>{p.name}</span>
                {activeProfile?.id === p.id && (
                  <span className="ml-auto text-xs text-primary">●</span>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate("/profili")}
              className="rounded-xl gap-2 cursor-pointer text-muted-foreground"
            >
              <UserCircle2 className="h-4 w-4" />
              Mainīt profilu
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick stats */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-sm font-extrabold">
          <div
            className="flex items-center gap-1 rounded-full bg-primary/15 text-primary px-2.5 py-1"
            title="XP punkti"
          >
            <Star className="h-4 w-4 fill-primary" />
            <span>{progress.xp}</span>
          </div>
          <div
            className="flex items-center gap-1 rounded-full bg-accent/30 text-accent-foreground px-2.5 py-1"
            title="Līmenis"
          >
            <span className="text-xs">Lv</span>
            <span>{level}</span>
          </div>
          <div
            className="flex items-center gap-1 rounded-full bg-secondary/20 text-secondary px-2.5 py-1"
            title="Dienu sērija"
          >
            <Flame className="h-4 w-4 fill-secondary" />
            <span>{progress.streak}</span>
          </div>
        </div>

        <nav className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-bold transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-foreground hover:bg-muted",
                )
              }
              aria-label={label}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden lg:inline">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};
