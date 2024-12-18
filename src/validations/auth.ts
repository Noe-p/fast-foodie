import { errorMessage } from '@/errors';
import { AuthLoginApi, RegisterApi, UpdateUserApi } from '@/types/api';
import * as yup from 'yup';
import { genericsValidation } from './generics';

const login = yup.object<AuthLoginApi>().shape({
  login: yup
    .string()
    .required(errorMessage.fields('login').REQUIRED)
    .typeError(errorMessage.fields('login').NOT_STRING),
  password: genericsValidation.password.required(
    errorMessage.fields('password').REQUIRED
  ),
});

export const authValidation = {
  login,
};
