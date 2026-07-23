import type { User } from "./model";

export type LoginResponse = {
  token: string;
  user: User;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  role: string;
  password: string;
  password_confirmation: string;
  study_class_id: number | null;
};
