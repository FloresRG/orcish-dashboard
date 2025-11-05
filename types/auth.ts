// types/auth.ts
export enum UserRole {
  ADMIN = 'admin',
  USER = 'usuario',
  GUEST = 'invitado',
}

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type LoginResponse = {
  user: User;
  token: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};