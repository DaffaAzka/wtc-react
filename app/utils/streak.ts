// ── Streak utility ──────────────────────────────────────────────────────────
//
// Stores: { streak: number, lastDate: "YYYY-MM-DD" } in localStorage.
// Pure calculation — no React dependencies.

const STORAGE_KEY = "wtc_streak";

export type StreakResult = {
  currentStreak: number;
  /** true when this is a brand-new user (registration) */
  isNewUser: boolean;
};

type StreakStore = {
  streak: number;
  lastDate: string; // "YYYY-MM-DD"
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function loadStore(): StreakStore | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StreakStore) : null;
  } catch {
    return null;
  }
}

function saveStore(store: StreakStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // storage unavailable — silently skip
  }
}

/**
 * Call once after a successful login or registration.
 *
 * @param isRegistration  Pass `true` on register — always sets streak to 1
 *                        and marks the user as new.
 */
export function computeAndSaveStreak(isRegistration: boolean): StreakResult {
  const today = todayISO();

  // Rule 1 — new registration
  if (isRegistration) {
    saveStore({ streak: 1, lastDate: today });
    return { currentStreak: 1, isNewUser: true };
  }

  const stored = loadStore();

  // No prior record → treat as first-ever login
  if (!stored) {
    saveStore({ streak: 1, lastDate: today });
    return { currentStreak: 1, isNewUser: false };
  }

  const { streak, lastDate } = stored;

  // Rule 3 — same day, no change
  if (lastDate === today) {
    return { currentStreak: streak, isNewUser: false };
  }

  // Rule 2 — consecutive day
  if (lastDate === yesterdayISO()) {
    const next = streak + 1;
    saveStore({ streak: next, lastDate: today });
    return { currentStreak: next, isNewUser: false };
  }

  // Rule 4 — streak broken
  saveStore({ streak: 1, lastDate: today });
  return { currentStreak: 1, isNewUser: false };
}
