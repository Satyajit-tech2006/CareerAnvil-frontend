export const ENDPOINTS = {
  // --- USER & AUTHENTICATION ---
  USERS: {
    REGISTER: '/users/register',
    LOGIN: '/users/login',
    LOGOUT: '/users/logout',
    REFRESH_TOKEN: '/users/refresh-token',
    CHANGE_PASSWORD: '/users/change-password', // Requires Old Password
    FORGOT_PASSWORD: '/users/forgot-password', // Sends OTP
    RESET_PASSWORD: '/users/reset-password',   // Verify OTP + New Password
    CURRENT_USER: '/users/current-user',
    UPDATE_PROFILE: '/users/update-profile',
    GOOGLE_AUTH: '/users/auth/google',
  },

  // --- JOB BOARD ---
  JOBS: {
    GET_ALL: '/jobs',
    CREATE: '/jobs/create',
    UPDATE: (id) => `/jobs/${id}`,
    DELETE: (id) => `/jobs/${id}`,
    CLEANUP: '/jobs/cleanup/expired',
  },

  // --- DSA SHEETS ---
  SHEETS: {
    GET_ALL: '/sheets',
    GET_BY_SLUG: (slug) => `/sheets/${slug}`,
    CREATE: '/sheets',
    UPDATE: (id) => `/sheets/${id}`,
    DELETE: (id) => `/sheets/${id}`,
  },

  // --- SECTIONS ---
  SECTIONS: {
    GET_BY_SHEET: (sheetId) => `/sections/sheet/${sheetId}`,
    CREATE: '/sections',
    UPDATE: (id) => `/sections/${id}`,
    DELETE: (id) => `/sections/${id}`,
  },

  // --- ITEMS ---
  ITEMS: {
    GET_BY_SECTION: (sectionId) => `/items/section/${sectionId}`,
    CREATE: '/items',
    UPDATE: (id) => `/items/${id}`,
    DELETE: (id) => `/items/${id}`,
  },

  // --- ENROLLMENT ---
  ENROLLMENT: {
    ENROLL: '/enrollments',
    MY_SHEETS: '/enrollments/my-sheets',
  },

  // --- PROGRESS ---
  PROGRESS: {
    TOGGLE: '/progress/toggle',
    GET_SHEET_PROGRESS: (sheetId) => `/progress/${sheetId}`,
  },

  // --- NOTES ---
  NOTES: {
    GET: (itemId) => `/notes/${itemId}`,
    SAVE: '/notes',
  },

  // --- ATS & KEYWORDS ---
  ATS: {
    ANALYZE: '/ats/analyze',
    EXTRACT_KEYWORDS: '/ats/extract-keywords',
    GET_CREDITS: '/ats/credits',
  },

  // --- PAYMENTS (NEW) ---
  PAYMENTS: {
    INITIATE: '/payments/initiate',       // POST
    SUBMIT_UTR: '/payments/submit-utr',   // POST
    GET_ACTIVE: '/payments/active',       // GET
    ADMIN_VERIFY: '/payments/admin/verify', // POST (Admin)
    ADMIN_GET_ALL: (status) => `/payments/admin/all?status=${status}`, // GET (Admin)
    ADMIN_CLEANUP: '/payments/admin/cleanup', // POST (Admin) <--- NEW
  }
};