export const ENDPOINTS = {
  // --- USER & AUTHENTICATION ---
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
    GOOGLE_AUTH: '/users/auth/google',
  },

  // --- JOB BOARD ---
  JOBS: {
    GET_ALL: '/jobs',                      // GET /api/v1/jobs
    CREATE: '/jobs/create',                // POST /api/v1/jobs/create (Admin only)
    UPDATE: (id) => `/jobs/${id}`,         // PATCH /api/v1/jobs/:id (Admin only)
    DELETE: (id) => `/jobs/${id}`,         // DELETE /api/v1/jobs/:id (Admin only)
    CLEANUP: '/jobs/cleanup/expired',      // DELETE /api/v1/jobs/cleanup/expired (Admin only)
  },

  // --- DSA SHEETS (The Roadmaps) ---
  SHEETS: {
    GET_ALL: '/sheets',                    // GET /api/v1/sheets
    GET_BY_SLUG: (slug) => `/sheets/${slug}`, // GET /api/v1/sheets/:slug
    CREATE: '/sheets',                     // POST /api/v1/sheets (Admin only)
    UPDATE: (id) => `/sheets/${id}`,       // PATCH /api/v1/sheets/:id (Admin only)
    DELETE: (id) => `/sheets/${id}`,       // DELETE /api/v1/sheets/:id (Admin only)
  },

  // --- SECTIONS (Topics inside a Sheet) ---
  SECTIONS: {
    GET_BY_SHEET: (sheetId) => `/sections/sheet/${sheetId}`, // GET /api/v1/sections/sheet/:sheetId
    CREATE: '/sections',                   // POST /api/v1/sections (Admin only)
    UPDATE: (id) => `/sections/${id}`,     // PATCH /api/v1/sections/:id (Admin only)
    DELETE: (id) => `/sections/${id}`,     // DELETE /api/v1/sections/:id (Admin only)
  },

  // --- ITEMS (Questions/Resources inside a Section) ---
  ITEMS: {
    GET_BY_SECTION: (sectionId) => `/items/section/${sectionId}`, // GET /api/v1/items/section/:sectionId
    CREATE: '/items',                      // POST /api/v1/items (Admin only)
    UPDATE: (id) => `/items/${id}`,        // PATCH /api/v1/items/:id (Admin only)
    DELETE: (id) => `/items/${id}`,        // DELETE /api/v1/items/:id (Admin only)
  },

  // --- ENROLLMENT (User tracking a Sheet) ---
  ENROLLMENT: {
    ENROLL: '/enrollments',                // POST /api/v1/enrollments (Start a sheet)
    MY_SHEETS: '/enrollments/my-sheets',   // GET /api/v1/enrollments/my-sheets (Dashboard list)
  },

  // --- PROGRESS (Tracking checkboxes) ---
  PROGRESS: {
    TOGGLE: '/progress/toggle',            // POST /api/v1/progress/toggle (Mark done/todo)
    GET_SHEET_PROGRESS: (sheetId) => `/progress/${sheetId}`, // GET /api/v1/progress/:sheetId
  },

  // --- NOTES (Rich Text Content) ---
  NOTES: {
    GET: (itemId) => `/notes/${itemId}`,   // GET /api/v1/notes/:itemId
    SAVE: '/notes',                        // POST /api/v1/notes (Upsert)
  },

  // --- ATS & KEYWORDS ---
  ATS: {
    ANALYZE: '/ats/analyze',               // POST /api/v1/ats/analyze
    EXTRACT_KEYWORDS: '/ats/extract-keywords', // POST /api/v1/ats/extract-keywords
  }
};