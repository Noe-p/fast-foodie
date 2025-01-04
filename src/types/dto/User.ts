import { BaseDto } from './BaseDto';
import { Collaborator } from './Collaborators';

export interface User extends BaseDto {
  userName: string;
  collaborators: Collaborator[];
}
