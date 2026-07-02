import type { User } from "./model";

export type LoginResponse = {
  token: string;
  user: User;
};
