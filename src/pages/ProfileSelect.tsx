import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProfiles, type Profile } from "@/contexts/ProfileContext";
import { Mascot } from "@/components/Mascot";
import { cn } from "@/lib/utils";

const ringClasses: Record<Profile["color"], string> = {
  primary: "hover:ring-primary/40 hover:border-primary",
  secondary: "hover:ring-secondary/40 hover:border-secondary",
  accent: "hover:ring-accent/50 hover:border-accent",
  success: "hover:ring-success/40 hover:border-success",
};

const bgClasses: Record<Profile["color"], string> = {
  primary: "bg-primary/15",
  secondary: "bg-secondary/15",
  accent: "bg-accent/25",
  success: "bg-success/15",
};

const ProfileSelect = () => {
  const { profiles, setActive, updateProfile } = useProfiles();
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const choose = (id: string) => {
    setActive(id);
    navigate("/");
  };

  const startEdit = (p: Profile) => {
    setEditingId(p.id);
    setDraftName(p.name);
  };

  const saveEdit = (id: string) => {
    const trimmed = draftName.trim();
    if (trimmed) updateProfile(id, { name: trimmed });
    setEditingId(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <Mascot size={120} mood="wave" className="mx-auto mb-4 animate-bounce-soft" />
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Kurš mācīsies? 🦊</h1>
        <p className="text-muted-foreground text-lg">Izvēlies savu profilu</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {profiles.map((p) => {
          const isEditing = editingId === p.id;
          return (
            <Card
              key={p.id}
              className={cn(
                "p-6 rounded-3xl border-2 transition-all animate-pop ring-4 ring-transparent",
                !isEditing && "cursor-pointer hover:scale-[1.03]",
                ringClasses[p.color],
              )}
              onClick={() => !isEditing && choose(p.id)}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div
                  className={cn(
                    "h-24 w-24 rounded-full flex items-center justify-center text-6xl shadow-card",
                    bgClasses[p.color],
                  )}
                >
                  {p.avatar}
                </div>

                {isEditing ? (
                  <div className="flex gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                    <Input
                      autoFocus
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(p.id)}
                      maxLength={20}
                      className="h-12 rounded-2xl text-lg font-bold text-center border-2"
                    />
                    <Button
                      size="icon"
                      onClick={() => saveEdit(p.id)}
                      className="h-12 w-12 rounded-2xl shrink-0"
                      aria-label="Saglabāt"
                    >
                      <Check className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-extrabold">{p.name}</div>
                    <div className="flex gap-2 mt-1">
                      <Button
                        size="lg"
                        className="rounded-2xl btn-chunky font-extrabold h-12 px-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          choose(p.id);
                        }}
                      >
                        Sākt!
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-12 w-12 rounded-2xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(p);
                        }}
                        aria-label="Mainīt vārdu"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-8 text-center max-w-md">
        Katram bērnam ir savs progress, XP un sērija. Profilu var nomainīt jebkurā brīdī augšējā joslā.
      </p>
    </div>
  );
};

export default ProfileSelect;
