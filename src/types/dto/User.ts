import { BaseDto } from './BaseDto';
import { MediaDto } from './Media';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface UserDto extends BaseDto {
  userName: string;
  email: string;
  profilePicture?: MediaDto;
  role: UserRole;
}
