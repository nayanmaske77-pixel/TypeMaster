export type Difficulty = "easy" | "medium" | "hard";
export type GameMode =
  | "classic"
  | "time"
  | "rush"
  | "accuracy"
  | "quote"
  | "custom"
  | "beginner"
  | "advanced"
  | "daily"
  | "library";

export const EASY_WORDS =
  "the and you that was for are with his they one have this from had not but what all were when we there can your which their said if do will each about how up out them then she many some so these would other into has more her two like him see time could no make than first been its who now people my made over did down only way find use may water long little very after words called just where most know get through back much go good new write our me man too any day same right look think also around another came come work three word must because does part even place well such here take why help put different away again off went old number great tell men say small every found still between name should home big give air line set own under read last never us left end along while might next sound below saw something thought both few those always show large often together asked house world going want school important until form food keep children feet land side without boy once animal life enough took four head above kind began almost live page got earth need far hand high year mother light country father let night picture being study second soon story since white ever paper hard near sentence better best across during today however sure knew try told young sun thing whole hear example heard several change answer room sea against top turned learn point city play toward five himself usually money seen car morning".split(
    " ",
  );

export const SIMPLE_WORDS = "cat dog sun run fun hat big red cup map pen box top bed sit hop yes day way play see bee car bus tree home fish bird milk book cake ball love good nice blue green star moon rain snow walk talk hand foot".split(
  " ",
);

export const HARD_WORDS = "ubiquitous ephemeral quintessential juxtaposition idiosyncrasy perspicacious magnanimous obfuscate serendipity labyrinthine conscientious mischievous onomatopoeia surreptitious incandescent cacophony vicissitude sesquipedalian equanimity pusillanimous recalcitrant obsequious perfunctory esoteric melancholy paradigm acquiesce bureaucracy phenomenon entrepreneur rhythm accommodate millennium privilege questionnaire supersede".split(
  " ",
);

export const SENTENCES = [
  "Practice a little every day and your speed will grow.",
  "The quick brown fox jumps over the lazy dog.",
  "Keep your eyes on the screen and your fingers on the home row.",
  "Small steps every day lead to big results over time.",
  "Accuracy first, speed will follow naturally.",
  "A calm mind types faster than a rushed one.",
  "Good posture helps you type longer without getting tired.",
  "Every expert was once a beginner who never gave up.",
  "Reading ahead while typing keeps your rhythm smooth.",
  "Take a short break when your hands feel tense.",
];

export const PARAGRAPHS: Record<Difficulty, string[]> = {
  easy: [
    "The sun was warm and the sky was blue. We went to the park to play with our dog. He ran fast and we had a lot of fun together.",
    "My home is near a small river. In the morning I like to walk there and watch the birds. It is quiet and calm and it makes me happy.",
    "Typing is a skill that gets better with time. Look at the screen, keep your hands on the keys, and try to type each word with care.",
    "We made a cake for my mother. We used milk, eggs, and a little sugar. It was soft and sweet, and we shared it with our friends.",
  ],
  medium: [
    "Learning to type quickly is less about moving your fingers fast and more about building reliable muscle memory. When each key becomes automatic, your mind is free to focus on ideas instead of letters.",
    "Remote work has changed how teams communicate. Clear written messages, thoughtful documentation, and fast typing have become essential skills for anyone collaborating across time zones.",
    "The library was silent except for the soft rustle of pages. Students sat at long wooden tables, preparing for exams, while rain tapped gently against the tall windows.",
    "A good habit is easier to keep when it is enjoyable. That is why short daily practice sessions, combined with visible progress, work better than occasional marathon efforts.",
  ],
  hard: [
    "In 2024, approximately 63% of surveyed developers reported spending over 4.5 hours per day writing code; consequently, ergonomic keyboards (and efficient typing) became surprisingly important topics of discussion.",
    "The archaeologist's hypothesis, though initially dismissed as idiosyncratic, was later corroborated by radiocarbon dating: the artifacts were roughly 3,200 years old, not 1,800 as previously assumed.",
    "Quintessential examples of juxtaposition appear throughout literature; authors deliberately contrast light & dark, hope & despair, to illuminate the protagonist's internal conflicts.",
    "Configure the server with PORT=8080, set MAX_CONNECTIONS to 256, and ensure the cache TTL is 3600 seconds; otherwise, intermittent timeouts (error #504) may occur under heavy load.",
  ],
};

export const QUOTES = [
  "The secret of getting ahead is getting started. - Mark Twain",
  "It always seems impossible until it is done. - Nelson Mandela",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
  "Believe you can and you are halfway there. - Theodore Roosevelt",
  "Do what you can, with what you have, where you are. - Theodore Roosevelt",
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Quality is not an act, it is a habit. - Aristotle",
  "Discipline is the bridge between goals and accomplishment. - Jim Rohn",
  "You miss one hundred percent of the shots you do not take. - Wayne Gretzky",
  "Act as if what you do makes a difference. It does. - William James",
];

export interface LibraryCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  items: string[];
}

export const LIBRARY: LibraryCategory[] = [
  { id: "easy-words", name: "Easy English Words", description: "Short, common words to build rhythm.", icon: "Baby", items: [SIMPLE_WORDS.join(" "), EASY_WORDS.slice(0, 60).join(" ")] },
  { id: "sentences", name: "Common Sentences", description: "Everyday sentences with natural flow.", icon: "MessageSquare", items: SENTENCES },
  { id: "business", name: "Business Typing", description: "Emails, reports and meeting notes.", icon: "Briefcase", items: [
    "Dear team, please find attached the quarterly report. Revenue increased by twelve percent compared to last quarter.",
    "Thank you for your prompt response. I have scheduled a meeting for Thursday at ten to review the proposal.",
    "Our main objective this year is to improve customer satisfaction while reducing operational costs.",
    "Please confirm your availability for the client presentation so we can finalize the agenda.",
  ] },
  { id: "programming", name: "Programming Terms", description: "Developer vocabulary and syntax.", icon: "Code2", items: [
    "function variable constant array object string boolean integer callback promise async await interface module",
    "const total = items.reduce((sum, item) => sum + item.price, 0);",
    "git commit -m \"fix: handle empty input\" && git push origin main",
    "SELECT name, email FROM users WHERE active = true ORDER BY created_at DESC;",
  ] },
  { id: "technology", name: "Technology Paragraphs", description: "Read and type about modern tech.", icon: "Cpu", items: [
    "Artificial intelligence systems learn patterns from large amounts of data and use them to make predictions about new information.",
    "Cloud computing lets companies rent servers on demand instead of buying and maintaining their own hardware.",
    "Encryption protects data by converting it into a code that can only be read by someone with the correct key.",
  ] },
  { id: "vocabulary", name: "Difficult Vocabulary", description: "Challenging words for advanced typists.", icon: "GraduationCap", items: [HARD_WORDS.join(" ")] },
  { id: "numbers", name: "Numbers & Symbols", description: "Digits, prices, symbols and codes.", icon: "Hash", items: [
    "Order #4521 costs $129.99 + 18% tax = $153.39 (due 12/08/2026).",
    "Call 555-0198 or email support@example.com; ref: A7-X92 @ 3:45 PM.",
    "1234 5678 90 | 2 + 2 = 4 | 50% off | 3 * 7 = 21 | 100 / 4 = 25",
  ] },
  { id: "punctuation", name: "Punctuation Practice", description: "Commas, quotes, colons and more.", icon: "Quote", items: [
    "Wait! Did you hear that? \"Yes,\" she said, \"it came from upstairs.\"",
    "There are three options: red, green, or blue; choose wisely - you only get one.",
    "It's not what you say; it's how you say it (and when).",
  ] },
  { id: "quotes", name: "Motivational Quotes", description: "Type words that inspire you.", icon: "Sparkles", items: QUOTES },
];

/** Deterministic PRNG so daily challenges are the same all day. */
export function seededRandom(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const pick = <T,>(arr: T[], rnd: () => number): T => arr[Math.floor(rnd() * arr.length)] as T;
export const randomWords = (list: string[], n: number, rnd: () => number = Math.random) =>
  Array.from({ length: n }, () => pick(list, rnd)).join(" ");

export interface TextConfig {
  mode: GameMode;
  difficulty: Difficulty;
  category?: string | undefined;
  customText?: string | undefined;
}

const wordListFor = (d: Difficulty) => (d === "easy" ? SIMPLE_WORDS : d === "hard" ? [...EASY_WORDS, ...HARD_WORDS] : EASY_WORDS);

/** Modes where the text keeps growing until time runs out. */
export const isEndless = (mode: GameMode) => mode === "time" || mode === "rush";

export function generateText(cfg: TextConfig, rnd: () => number = Math.random): string {
  switch (cfg.mode) {
    case "time":
    case "rush":
      return randomWords(wordListFor(cfg.difficulty), 60, rnd);
    case "beginner":
      return [pick(SENTENCES.filter((s) => s.length < 50), rnd), randomWords(SIMPLE_WORDS, 20, rnd)].join(" ");
    case "advanced":
      return [pick(PARAGRAPHS.hard, rnd), pick(PARAGRAPHS.hard, rnd)].filter((v, i, a) => a.indexOf(v) === i).join(" ");
    case "accuracy":
      return Array.from({ length: 3 }, () => pick(SENTENCES, rnd)).join(" ");
    case "quote":
      return pick(QUOTES, rnd);
    case "custom":
      return (cfg.customText || "").replace(/\s+/g, " ").trim() || "Type your own text in the box above to practice it here.";
    case "library": {
      const cat = LIBRARY.find((c) => c.id === cfg.category) ?? LIBRARY[0]!;
      const count = cfg.difficulty === "easy" ? 1 : cfg.difficulty === "medium" ? 2 : 3;
      const items = [...cat.items].sort(() => rnd() - 0.5);
      return Array.from({ length: count }, (_, i) => items[i % items.length]).join(" ");
    }
    case "daily":
      return dailyChallenge().text;
    case "classic":
    default:
      return pick(PARAGRAPHS[cfg.difficulty], rnd);
  }
}

export function moreWords(cfg: TextConfig) {
  return " " + randomWords(wordListFor(cfg.difficulty), 30);
}

export function dailyChallenge(date = new Date()) {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const rnd = seededRandom(seed);
  const all = [...PARAGRAPHS.medium, ...PARAGRAPHS.easy, ...QUOTES];
  const text = pick(all, rnd) + " " + pick(SENTENCES, rnd);
  const themes = ["Speed Sprint", "Precision Run", "Flow State", "Steady Hands", "Focus Mode", "Rhythm Master", "Power Hour"];
  return {
    text,
    title: pick(themes, rnd),
    targetWpm: 25 + Math.floor(rnd() * 5) * 5,
    targetAccuracy: 92 + Math.floor(rnd() * 5),
    bonusXp: 100 + Math.floor(rnd() * 4) * 25,
  };
}

export const MODE_INFO: Record<GameMode, { name: string; description: string; icon: string; defaultDuration: number }> = {
  classic: { name: "Classic Test", description: "Type a paragraph as fast and accurately as possible.", icon: "Keyboard", defaultDuration: 60 },
  time: { name: "Time Challenge", description: "Endless words. Type as many as you can before time runs out.", icon: "Timer", defaultDuration: 30 },
  rush: { name: "Word Rush", description: "Words fly at you one by one. Hit them fast!", icon: "Zap", defaultDuration: 30 },
  accuracy: { name: "Accuracy Challenge", description: "Only 5 mistakes allowed. Precision over speed.", icon: "Target", defaultDuration: 0 },
  quote: { name: "Quote Typing", description: "Type famous motivational quotes.", icon: "Quote", defaultDuration: 0 },
  custom: { name: "Custom Practice", description: "Paste or write your own text to practice.", icon: "PenLine", defaultDuration: 0 },
  beginner: { name: "Beginner Mode", description: "Simple words and short sentences.", icon: "Sprout", defaultDuration: 60 },
  advanced: { name: "Advanced Mode", description: "Long paragraphs, numbers, punctuation and tough words.", icon: "Flame", defaultDuration: 120 },
  daily: { name: "Daily Challenge", description: "Today's special challenge with bonus XP.", icon: "CalendarCheck", defaultDuration: 0 },
  library: { name: "Library Practice", description: "Practice from a chosen category.", icon: "Library", defaultDuration: 0 },
};

export const ACCURACY_LIVES = 5;
