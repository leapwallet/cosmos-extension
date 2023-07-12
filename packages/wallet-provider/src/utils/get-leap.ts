import { Leap } from '../provider/types/leap';

declare global {
  interface Window {
    leap: any;
  }
}

export const getLeapFromWindow: () => Promise<Leap | undefined> = async () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  if (window.leap) {
    return window.leap;
  }

  if (document.readyState === 'complete') {
    return window.leap;
  }

  return new Promise((resolve) => {
    const documentStateChange = (event: Event) => {
      if (event.target && (event.target as Document).readyState === 'complete') {
        resolve(window.leap);
        document.removeEventListener('readystatechange', documentStateChange);
      }
    };

    document.addEventListener('readystatechange', documentStateChange);
  });
};
