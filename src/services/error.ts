/* eslint-disable indent */
import { TFunction } from 'next-i18next';
import { UseFormSetError } from 'react-hook-form';

export function formatApiErrorMessage(
  messages: string[] | string,
  t: TFunction
): string {
  if (!messages) return '';
  if (Array.isArray(messages)) {
    const apiMessages = messages
      .map((m) => m.split('api.')[1])
      .filter((m) => m);
    const inputs = messages
      .map((m) =>
        m.split('fields.')[1].substring(0, m.split('fields.')[1].indexOf('.'))
      )
      .filter((m) => m);
    if (apiMessages.length > 0) {
      return apiMessages.map((m) => t(`errors.${m}`)).join('\n');
    }
    if (inputs.length > 0) {
      const tradInput = inputs.map((m) => t(`fields.${m}.label`));
      return tradInput.length > 1
        ? t('errors.api.validation.multiple', {
            fields: tradInput.join(', '),
          })
        : t('errors.api.validation.single', {
            field: tradInput[0],
          });
    }
  } else {
    const apiMessages = messages.split('api.')[1];
    if (apiMessages) {
      return t(`errors.api.${apiMessages}`);
    }
  }
  return '';
}

export function formatValidationErrorMessage(
  messages: string[] | string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setError: UseFormSetError<any>
) {
  if (!messages) return {};
  if (Array.isArray(messages)) {
    const validations = messages
      .map((m) => m.split('fields:')[1])
      .filter((m) => m);
    if (validations.length > 0) {
      validations.forEach((validation) => {
        const [item, type] = validation.split('.');
        setError(
          item,
          { type, message: `fields:${validation}` },
          { shouldFocus: true }
        );
      });
    } else {
      return undefined;
    }
  } else {
    const isValidation = messages.includes('fields:');
    if (!isValidation) return undefined;
    const [item, type] = messages.split('fields:')[1].split('.');
    setError(item, { type, message: `${messages}` }, { shouldFocus: true });
  }
}
