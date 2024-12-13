import { errorMessage } from '../errors';
import { AuthLoginApi, CollaboratorApi, RegisterApi, UpdateUserApi } from '..//types/api';
import * as yup from 'yup';
import { genericsValidation } from './generics';

const add: yup.ObjectSchema<CollaboratorApi> = yup.object({
  email: genericsValidation.email.required(
    errorMessage.fields('email').REQUIRED
  ).email(errorMessage.fields('email').NOT_VALID),
});

export const collaboratorsValidation = {
  add,
};
