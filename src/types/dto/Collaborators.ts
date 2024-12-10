import { BaseDto } from "./BaseDto";
import { UserDto } from "./User";

export interface Collaborator {
  id: string;
  createdAt: Date;
  collaboratorId: string;
  userId: string;
  collaborator : UserDto;
}