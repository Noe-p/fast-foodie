import { BaseDto } from './BaseDto';
import { MediaDto } from './Media';

export interface User extends BaseDto {
  userName: string;
  profilePicture?: MediaDto;
  collaborators: User[];
}
