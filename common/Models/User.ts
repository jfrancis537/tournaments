export type UserRole = 'user' | 'admin';

export interface User {
  username: string;
  email: string;
  role: UserRole;
}