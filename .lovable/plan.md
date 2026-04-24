
# Mazais Angļu Valodas Piedzīvojums 🦊

Playful, Duolingo-inspired (but original) English learning web app for an 8-year-old Latvian child. Interface fully in Latvian, content teaches English. No login, progress saved locally.

## Visual Identity

- **Mascot:** "Rūdis" — a friendly orange fox character (built with SVG/emoji-style illustration, original).
- **Color palette (warm & playful, NOT Duolingo green):**
  - Primary: warm coral/orange `#FF7A59`
  - Secondary: sky blue `#4FC3F7`
  - Accent: sunny yellow `#FFD166`
  - Success: mint green `#6BCB77`
  - Background: cream `#FFF8F0`
- **Typography:** Rounded, friendly font (Nunito or similar via Google Fonts), large sizes for readability.
- **Style:** Big rounded cards, soft shadows, bouncy animations, generous spacing, large tap targets (min 60px).

## Screens & Navigation

Top nav bar with three sections (Latvian labels):
- 🏠 **Sākums** (Home)
- 🗺️ **Mācības** (Lesson Map)
- 👨‍👩‍👧 **Vecākiem** (Parents)

### 1. Home Screen (Sākums)
- Big mascot waving + welcome: *"Sveiks! Es esmu Rūdis. Mācīsimies angļu valodu kopā!"*
- Stats cards: ⭐ XP, 🏆 Līmenis, 🔥 Sērija (streak), ✅ Pabeigtās mācības
- Large CTA button: **"Sākt mācīties!"** → jumps to next unfinished lesson
- "Diena šodien" tip: a fun English word of the day with audio button

### 2. Lesson Map (Mācības)
- Vertical winding path of lesson "bubbles" (like stepping stones), mascot sitting at current position
- 7 units, each with icon + Latvian title + completion stars (0–3)
- Locked lessons show 🔒 (must complete previous); unlocked are colorful and bouncy on hover
- Units: Sveicieni 👋, Krāsas 🎨, Dzīvnieki 🐱, Skaitļi 🔢, Ģimene 👨‍👩‍👧, Skola 📚, Ēdiens 🍎

### 3. Lesson Player
- Top: progress bar + ❤️ hearts (3 mistakes allowed before gentle restart, no harsh failure)
- Each lesson = 6–8 mini-exercises mixing all 6 exercise types
- Instructions always in Latvian (e.g., *"Izvēlies pareizo vārdu"*)
- After each answer: animated feedback card
  - ✅ Correct: *"Lieliski!"* / *"Tu to vari!"* + +10 XP, mascot cheers, soft chime
  - ❌ Wrong: *"Gandrīz! Pareizā atbilde ir..."* + gentle shake, shows correct answer
- End of lesson: celebration screen with stars earned, XP gained, mascot dancing, button *"Turpināt"*

### 4. Exercise Types (all 6)
1. **Multiple choice** — *"Kā angliski 'kaķis'?"* → 4 word buttons
2. **Matching** — two columns (Latvian ↔ English), tap to pair
3. **Translation** — English shown, choose Latvian meaning
4. **Listening** 🔊 — Web Speech API speaks English word, child picks from options
5. **Typing** — *"Uzraksti angliski 'suns'"* → input box (case-insensitive, ignores extra spaces)
6. **Picture choice** — emoji/icon grid, pick the one matching the English word

### 5. Parents View (Vecākiem)
- Clean dashboard (slightly more grown-up styling but still warm)
- Cards: Pabeigtās mācības, Iemācītie vārdi (with expandable list), Kopējais XP, Pašreizējā sērija
- "Jāatkārto" section: words the child got wrong most often
- Reset progress button (with confirmation)

## Gamification System
- +10 XP per correct answer, +50 XP lesson completion bonus
- Level = floor(XP / 200) + 1
- Streak: increments daily on any lesson activity, resets after 1 missed day (tracked via localStorage date)
- Stars per lesson: 3 (no mistakes), 2 (1–2 mistakes), 1 (3+ mistakes)
- Badges unlocked at milestones (first lesson, first unit complete, 7-day streak, etc.)

## Data Structure
- `src/data/lessons.ts` — typed lesson catalog (units → lessons → exercises) so adding new content is trivial
- Each word entry: `{ lv, en, emoji }` reusable across exercise types

## Technical
- React + TypeScript + Tailwind + React Router
- localStorage hook (`useProgress`) for XP, streak, completed lessons, mistakes log, last active date
- Web Speech API wrapper (`speak(text)`) with `lang: 'en-US'` for pronunciation
- Framer-motion-style animations using Tailwind keyframes (fade-in, scale-in, bounce, confetti on success)
- Fully responsive: single-column mobile, wider cards on desktop
- Design tokens defined in `index.css` + `tailwind.config.ts` (HSL semantic tokens)

## Out of Scope (v1)
- No login/accounts, no backend, no audio recording, no multiplayer, no ads
