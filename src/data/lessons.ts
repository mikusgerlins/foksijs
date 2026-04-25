export type Word = { lv: string; en: string; emoji: string };

export type Unit = {
  id: string;
  title: string;       // Latvian
  subtitle: string;    // Latvian
  emoji: string;
  color: "primary" | "secondary" | "accent" | "success";
  words: Word[];
};

export const UNITS: Unit[] = [
  {
    id: "greetings",
    title: "Sveicieni",
    subtitle: "Sveiki, atā, labrīt",
    emoji: "👋",
    color: "primary",
    words: [
      { lv: "sveiki", en: "hello", emoji: "👋" },
      { lv: "atā", en: "goodbye", emoji: "🖐️" },
      { lv: "labrīt", en: "good morning", emoji: "🌅" },
      { lv: "ar labu nakti", en: "good night", emoji: "🌙" },
    ],
  },
  {
    id: "colors",
    title: "Krāsas",
    subtitle: "Sarkans, zils, zaļš, dzeltens",
    emoji: "🎨",
    color: "secondary",
    words: [
      { lv: "sarkans", en: "red", emoji: "🟥" },
      { lv: "zils", en: "blue", emoji: "🟦" },
      { lv: "zaļš", en: "green", emoji: "🟩" },
      { lv: "dzeltens", en: "yellow", emoji: "🟨" },
    ],
  },
  {
    id: "animals",
    title: "Dzīvnieki",
    subtitle: "Kaķis, suns, putns, zivs",
    emoji: "🐱",
    color: "accent",
    words: [
      { lv: "kaķis", en: "cat", emoji: "🐱" },
      { lv: "suns", en: "dog", emoji: "🐶" },
      { lv: "putns", en: "bird", emoji: "🐦" },
      { lv: "zivs", en: "fish", emoji: "🐟" },
    ],
  },
  {
    id: "numbers",
    title: "Skaitļi",
    subtitle: "No viens līdz desmit",
    emoji: "🔢",
    color: "success",
    words: [
      { lv: "viens", en: "one", emoji: "1️⃣" },
      { lv: "divi", en: "two", emoji: "2️⃣" },
      { lv: "trīs", en: "three", emoji: "3️⃣" },
      { lv: "četri", en: "four", emoji: "4️⃣" },
      { lv: "pieci", en: "five", emoji: "5️⃣" },
      { lv: "seši", en: "six", emoji: "6️⃣" },
      { lv: "septiņi", en: "seven", emoji: "7️⃣" },
      { lv: "astoņi", en: "eight", emoji: "8️⃣" },
      { lv: "deviņi", en: "nine", emoji: "9️⃣" },
      { lv: "desmit", en: "ten", emoji: "🔟" },
    ],
  },
  {
    id: "family",
    title: "Ģimene",
    subtitle: "Mamma, tētis, māsa, brālis",
    emoji: "👨‍👩‍👧",
    color: "primary",
    words: [
      { lv: "mamma", en: "mother", emoji: "👩" },
      { lv: "tētis", en: "father", emoji: "👨" },
      { lv: "māsa", en: "sister", emoji: "👧" },
      { lv: "brālis", en: "brother", emoji: "👦" },
    ],
  },
  {
    id: "school",
    title: "Skola",
    subtitle: "Grāmata, pildspalva, skolotājs",
    emoji: "📚",
    color: "secondary",
    words: [
      { lv: "grāmata", en: "book", emoji: "📖" },
      { lv: "pildspalva", en: "pen", emoji: "🖊️" },
      { lv: "skolotājs", en: "teacher", emoji: "👩‍🏫" },
      { lv: "galds", en: "desk", emoji: "🟫" },
    ],
  },
  {
    id: "food",
    title: "Ēdiens",
    subtitle: "Ābols, maize, piens, ūdens",
    emoji: "🍎",
    color: "accent",
    words: [
      { lv: "ābols", en: "apple", emoji: "🍎" },
      { lv: "maize", en: "bread", emoji: "🍞" },
      { lv: "piens", en: "milk", emoji: "🥛" },
      { lv: "ūdens", en: "water", emoji: "💧" },
    ],
  },
  {
    id: "body",
    title: "Ķermenis",
    subtitle: "Galva, roka, kāja, acis",
    emoji: "🧍",
    color: "success",
    words: [
      { lv: "galva", en: "head", emoji: "🗣️" },
      { lv: "roka", en: "hand", emoji: "✋" },
      { lv: "kāja", en: "leg", emoji: "🦵" },
      { lv: "acs", en: "eye", emoji: "👁️" },
      { lv: "auss", en: "ear", emoji: "👂" },
      { lv: "mute", en: "mouth", emoji: "👄" },
    ],
  },
  {
    id: "clothes",
    title: "Apģērbs",
    subtitle: "Krekls, bikses, kurpes, cepure",
    emoji: "👕",
    color: "primary",
    words: [
      { lv: "krekls", en: "shirt", emoji: "👕" },
      { lv: "bikses", en: "pants", emoji: "👖" },
      { lv: "kurpes", en: "shoes", emoji: "👟" },
      { lv: "cepure", en: "hat", emoji: "🧢" },
      { lv: "kleita", en: "dress", emoji: "👗" },
    ],
  },
  {
    id: "weather",
    title: "Laikapstākļi",
    subtitle: "Saule, lietus, sniegs, vējš",
    emoji: "☀️",
    color: "secondary",
    words: [
      { lv: "saule", en: "sun", emoji: "☀️" },
      { lv: "lietus", en: "rain", emoji: "🌧️" },
      { lv: "sniegs", en: "snow", emoji: "❄️" },
      { lv: "vējš", en: "wind", emoji: "💨" },
      { lv: "mākonis", en: "cloud", emoji: "☁️" },
    ],
  },
  {
    id: "days",
    title: "Nedēļas dienas",
    subtitle: "Pirmdiena, otrdiena, trešdiena",
    emoji: "📅",
    color: "accent",
    words: [
      { lv: "pirmdiena", en: "Monday", emoji: "1️⃣" },
      { lv: "otrdiena", en: "Tuesday", emoji: "2️⃣" },
      { lv: "trešdiena", en: "Wednesday", emoji: "3️⃣" },
      { lv: "ceturtdiena", en: "Thursday", emoji: "4️⃣" },
      { lv: "piektdiena", en: "Friday", emoji: "5️⃣" },
      { lv: "sestdiena", en: "Saturday", emoji: "6️⃣" },
      { lv: "svētdiena", en: "Sunday", emoji: "7️⃣" },
    ],
  },
  {
    id: "actions",
    title: "Darbības",
    subtitle: "Iet, skriet, ēst, gulēt",
    emoji: "🏃",
    color: "success",
    words: [
      { lv: "iet", en: "go", emoji: "🚶" },
      { lv: "skriet", en: "run", emoji: "🏃" },
      { lv: "ēst", en: "eat", emoji: "🍽️" },
      { lv: "dzert", en: "drink", emoji: "🥤" },
      { lv: "gulēt", en: "sleep", emoji: "😴" },
      { lv: "spēlēt", en: "play", emoji: "🎮" },
    ],
  },
  {
    id: "home",
    title: "Mājas",
    subtitle: "Māja, durvis, logs, gulta",
    emoji: "🏠",
    color: "primary",
    words: [
      { lv: "māja", en: "house", emoji: "🏠" },
      { lv: "durvis", en: "door", emoji: "🚪" },
      { lv: "logs", en: "window", emoji: "🪟" },
      { lv: "gulta", en: "bed", emoji: "🛏️" },
      { lv: "krēsls", en: "chair", emoji: "🪑" },
    ],
  },
  {
    id: "nature",
    title: "Daba",
    subtitle: "Koks, zieds, upe, kalns",
    emoji: "🌳",
    color: "success",
    words: [
      { lv: "koks", en: "tree", emoji: "🌳" },
      { lv: "zieds", en: "flower", emoji: "🌸" },
      { lv: "upe", en: "river", emoji: "🏞️" },
      { lv: "kalns", en: "mountain", emoji: "⛰️" },
      { lv: "mežs", en: "forest", emoji: "🌲" },
    ],
  },
  {
    id: "transport",
    title: "Transports",
    subtitle: "Mašīna, autobuss, vilciens, lidmašīna",
    emoji: "🚗",
    color: "secondary",
    words: [
      { lv: "mašīna", en: "car", emoji: "🚗" },
      { lv: "autobuss", en: "bus", emoji: "🚌" },
      { lv: "vilciens", en: "train", emoji: "🚆" },
      { lv: "lidmašīna", en: "plane", emoji: "✈️" },
      { lv: "velosipēds", en: "bike", emoji: "🚲" },
    ],
  },
];

export const findUnit = (id: string) => UNITS.find((u) => u.id === id);

export const allWords = (): Word[] => UNITS.flatMap((u) => u.words);
