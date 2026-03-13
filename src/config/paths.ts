const getCurrentOrigin = (): string => {
  if (
    typeof window === 'undefined' ||
    typeof window.location?.origin !== 'string'
  ) {
    return '';
  }

  return window.location.origin;
};

export const WEB_APP_ORIGIN = getCurrentOrigin();
export const WEB_APP_BASE_PATH = '/';
export const WEB_APP_URL = WEB_APP_ORIGIN;

export const getWebRedirectUri = (origin = WEB_APP_ORIGIN): string => {
  return origin ? `${origin}/` : '/';
};

export const WEB_LINKING_PREFIXES = [WEB_APP_URL, getWebRedirectUri()].filter(
  Boolean,
);
