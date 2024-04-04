import { storage } from './global-vars';

type SetDisabledKeyInStorage = {
  setResource: (param: any) => void;
  storageKey: string;
  objectKey: string;
  storage: storage;
  defaultResourceData?: any;
};

export function getDisabledKeySetter({
  setResource,
  defaultResourceData,
  storageKey,
  objectKey,
  storage,
}: SetDisabledKeyInStorage) {
  return async function (disabledValue: string[]) {
    if (Object.keys(defaultResourceData ?? {}).length > 0) {
      setResource({ ...(defaultResourceData ?? {}), [objectKey]: disabledValue });
    } else {
      setResource({ [objectKey]: disabledValue });
    }

    const disabledCW20Tokens = await storage.get(storageKey);
    if (disabledCW20Tokens) {
      const storedDisabledCW20Tokens = JSON.parse(disabledCW20Tokens);
      await storage.set(
        storageKey,
        JSON.stringify({
          ...storedDisabledCW20Tokens,
          [objectKey]: disabledValue,
        }),
      );
    } else {
      await storage.set(storageKey, JSON.stringify({ [objectKey]: disabledValue }));
    }
  };
}
