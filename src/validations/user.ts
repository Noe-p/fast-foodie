import { errorMessage } from '@/errors';
import { AuthLoginApi, RegisterApi, UpdateUserApi } from '@/types/api';
import * as yup from 'yup';
import { genericsValidation } from './generics';

const update: yup.ObjectSchema<UpdateUserApi> = yup.object({
  email: genericsValidation.email
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
  firstName: yup
    .string()
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
  lastName: yup
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
  lastName: yup
    .string()
    .required(errorMessage.fields('lastName').REQUIRED)
    .typeError(errorMessage.fields('lastName').NOT_STRING),
  firstName: yup
    .string()
    .required(errorMessage.fields('firstName').REQUIRED)
    .typeError(errorMessage.fields('firstName').NOT_STRING),
});

const login = yup.object<AuthLoginApi>().shape({
  email: yup
    .string()
    .required(errorMessage.fields('email').REQUIRED)
    .typeError(errorMessage.fields('email').NOT_STRING),
  password: genericsValidation.password.required(
    errorMessage.fields('password').REQUIRED
  ),
});

export const userValidation = {
  update,
  login,
  create,
};