import { BaseDto } from './BaseDto';

export interface User extends BaseDto {
  userName: string;
  email: string;
}
