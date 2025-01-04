import * as yup from 'yup';
import { CollaboratorApi } from '..//types/api';
import { errorMessage } from '../errors';

const add: yup.ObjectSchema<CollaboratorApi> = yup.object({
  userName: yup
    .string()
    .required(errorMessage.fields('userName').REQUIRED)
    .typeError(errorMessage.fields('userName').NOT_STRING),
});

export const collaboratorsValidation = {
  add,
};
