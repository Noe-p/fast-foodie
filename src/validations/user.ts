import { errorMessage } from '@/errors';
import { AuthLoginApi, RegisterApi, UpdateUserApi } from '@/types/api';
import * as yup from 'yup';
import { genericsValidation } from './generics';

const update: yup.ObjectSchema<UpdateUserApi> = yup.object({
  email: genericsValidation.email
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
  userName: yup
    .string()
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
  profilePicture: yup
    .string()
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
});

const create: yup.ObjectSchema<RegisterApi> = yup.object({
  email: genericsValidation.email.required(
    errorMessage.fields('email').REQUIRED
  ),
  password: genericsValidation.password.required(
    errorMessage.fields('password').REQUIRED
  ),
  userName: yup
    .string()
    .required(errorMessage.fields('userName').REQUIRED)
    .typeError(errorMessage.fields('userName').NOT_STRING),
});

export const userValidation = {
  update,
  create,
};
