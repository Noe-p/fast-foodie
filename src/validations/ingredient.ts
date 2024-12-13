import { errorMessage } from '../errors';
import { AuthLoginApi, CollaboratorApi, CreateIngredientApi, RegisterApi, UpdateIngredientApi, UpdateUserApi } from '../types/api';
import * as yup from 'yup';
import { genericsValidation } from './generics';

const add: yup.ObjectSchema<CreateIngredientApi> = yup.object({
    foodId: yup
      .string()
      .required(errorMessage.fields('id').REQUIRED)
      .typeError(errorMessage.fields('id').NOT_STRING),
    quantity: yup
      .string()
      .required(errorMessage.fields('quantity').REQUIRED)
      .typeError(errorMessage.fields('quantity').NOT_STRING),
});

const update: yup.ObjectSchema<UpdateIngredientApi> = yup.object({
  quantity: yup
    .string()
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .default(undefined),
});

export const ingredientValidation = {
  add,
  update,
};
