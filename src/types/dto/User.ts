import { BaseDto } from './BaseDto';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}
export interface User extends BaseDto {
  userName: string;
  email: string;
  role: UserRole;
}
