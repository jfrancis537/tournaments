export type UserRole = 'User' | 'Admin';

export interface User {
  email: string;
  roles: UserRole[];
}

export interface UserRecord extends User{
  salt: string;
  hash: string;
  createdDate: string;
  registrationToken?: string;
}