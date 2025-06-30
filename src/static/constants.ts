export const IMAGE_FALLBACK = '/images/image-fallback.webP';

export const LOGO_URL = '/img/logo.svg';

export const AVATAR_PLACEHOLDER_URL =
  'https://www.w3schools.com/howto/img_avatar.png';

export const BREAKPOINTS = {
  SM: 768 + 1,
  MD: 1024 + 1,
  LG: 1280 + 1,
  XL: 1280 + 1,
};

export const MEDIA_QUERIES = {
  SM: `(max-width: ${BREAKPOINTS.SM - 1}px)`,
  MD: `(min-width: ${BREAKPOINTS.MD}px)`,
  LG: `(min-width: ${BREAKPOINTS.LG}px)`,
  XL: `(min-width: ${BREAKPOINTS.XL}px)`,
};
