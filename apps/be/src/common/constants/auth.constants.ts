export const AUTH_COOKIES = {
  ACCESS_TOKEN: 'qn_access_token',
  REFRESH_TOKEN: 'qn_refresh_token',
} as const;

export const COOKIE_OPTIONS = {
  ACCESS_TOKEN_EXPIRES: 15 * 60 * 1000,
  REFRESH_TOKEN_EXPIRES: 7 * 24 * 60 * 60 * 1000,
} as const;
