export const ENDPOINTS = {
  USERS: {
    REGISTER: '/users/register',
    LOGIN: '/users/login',
    LOGOUT: '/users/logout',
    REFRESH_TOKEN: '/users/refresh-token',
    CHANGE_PASSWORD: '/users/change-password',
    FORGOT_PASSWORD: '/users/forgot-password',
    RESET_PASSWORD: (token) => `/users/reset-password/${token}`,
    CURRENT_USER: '/users/current-user',
    UPDATE_PROFILE: '/users/update-profile',
  }
};