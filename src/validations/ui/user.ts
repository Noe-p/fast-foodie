import { errorMessage } from '@/errors';
import * as yup from 'yup';
import { userValidation } from '../user';

const create = userValidation.create.concat(
  yup.object().shape({
    confirmPassword: yup
      .string()
      .oneOf(
        [yup.ref('password'), undefined],
        errorMessage.fields('confirmPassword').NOT_MATCH
      ),
  })
);

export const userValidationUi = {
  create,
};
