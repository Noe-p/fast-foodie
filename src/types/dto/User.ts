import { BaseDto } from './BaseDto';

export interface User extends BaseDto {
  userName: string;
  collaborators: User[];
}
