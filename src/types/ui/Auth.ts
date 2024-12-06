import { RegisterApi } from '../api';

export interface AuthRegisterUi extends RegisterApi {
  confirmPassword?: string;
}
