import { BaseDto } from "./BaseDto";
import { User } from "./User";

export interface Collaborator {
  id: string;
  createdAt: Date;
  collaboratorId: string;
  userId: string;
  collaborator : User;
}