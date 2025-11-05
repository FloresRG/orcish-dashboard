// types/auth.ts
export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type LoginResponse = {
  user: User;
  token: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};