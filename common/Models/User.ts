export type UserRole = 'user' | 'admin';

export interface User {
  email: string;
  role: UserRole;
}

export interface UserRecord extends User{
  salt: string;
  hash: string;
  createdDate: string;
  registrationToken?: string;
}