import axios from 'axios';

import { Validator } from '../types';

export const fillValidatorsImage = async (validators: Validator[]) => {
  const _validators = await Promise.all(
    validators.map(async (validator) => {
      if ((validator.image && validator.image !== '') || (validator.keybase_image && validator.keybase_image !== '')) {
        return validator;
      }

      if (validator.description?.identity) {
        try {
          const { data } = await axios.get(
            `https://keybase.io/_/api/1.0/user/user_search.json?q=${validator.description.identity}&num_wanted=1`,
          );
          const { keybase } = data.list[0];
          const { picture_url } = keybase;

          return { ...validator, keybase_image: picture_url, image: picture_url };
        } catch (_) {
          return validator;
        }
      } else {
        return validator;
      }
    }),
  );

  return _validators;
};
