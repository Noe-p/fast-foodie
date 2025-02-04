import { BaseDto } from './BaseDto';
import { CollaboratorDto } from './Collaborators';
import { MediaDto } from './Media';

export interface User extends BaseDto {
  userName: string;
  profilePicture?: MediaDto;
  collaborators: CollaboratorDto[];
  collabSend: CollaboratorDto[];
}
