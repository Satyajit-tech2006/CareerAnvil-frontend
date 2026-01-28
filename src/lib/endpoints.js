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
  },
  JOBS: {
    GET_ALL: '/jobs',                      // GET /api/v1/jobs
    CREATE: '/jobs/create',                // POST /api/v1/jobs/create (Admin only)
    UPDATE: (id) => `/jobs/${id}`,         // PATCH /api/v1/jobs/:id (Admin only)
    DELETE: (id) => `/jobs/${id}`,         // DELETE /api/v1/jobs/:id (Admin only)
    CLEANUP: '/jobs/cleanup/expired',      // DELETE /api/v1/jobs/cleanup/expired (Admin only)
  }
};