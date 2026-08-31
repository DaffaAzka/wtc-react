import type { Track } from "./model";

// ── Certificate ──────────────────────────────────────────────────────────────

export type CertificateStatus = "issued" | "update_available";

export type Certificate = {
  id: string;
  certificate_number: string;
  grade: string;
  grade_score: number;
  status: CertificateStatus;
  issued_at: string;
  track: Pick<Track, "id" | "title" | "slug" | "image_url">;
};

// ── Template ─────────────────────────────────────────────────────────────────

export type CertificateTemplate = {
  id?: string;
  name?: string;
  html_template: string;
  css_styles: string;
  background_url: string | null;
  logo_url: string | null;
  signature_url: string | null;
  is_active?: boolean;
};

// ── Achievements & Badges ─────────────────────────────────────────────────────

export type TriggerType =
  | "manual"
  | "first_login"
  | "track_complete"
  | "challenge_grade_a"
  | "certificate_earned"
  | "points_milestone"
  | "streak_days";

export type TriggerConfig = {
  track_id?: number;
  track_slug?: string;
  threshold?: number;
  [key: string]: unknown;
};

export type Achievement = {
  id: number;
  name: string;
  description: string | null;
  badge_emoji: string;
  trigger_type: TriggerType;
  trigger_config: TriggerConfig | null;
  points_reward: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Badge = {
  achievement_id: number;
  achievement: Achievement;
  pinned_at?: string;
};

export type EarnedAchievement = {
  id: number;
  profile_id: string;
  achievement_id: number;
  achievement: Achievement;
  earned_at: string;
};

// ── Verify ────────────────────────────────────────────────────────────────────

export type VerifyResponse = {
  valid: boolean;
  certificate?: {
    certificate_number?: string;
    grade: string;
    grade_score: number;
    issued_at: string;
    profile: {
      display_name: string;
    };
    track: {
      title: string;
    };
  };
};
