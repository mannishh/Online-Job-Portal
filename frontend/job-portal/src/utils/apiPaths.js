export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register", // Signup
    LOGIN: "/api/auth/login", // Authenticate user & return JWT token
    GET_PROFILE: "/api/auth/profile", // Get logged-in user details
    UPDATE_PROFILE: "/api/user/profile", // Update profile details
    DELETE_RESUME: "/api/user/resume", // Delete resume details
  },

  DASHBOARD: {
    OVERVIEW: "/api/analytics/overview",
  },

  JOBS: {
    GET_ALL_JOBS: "/api/jobs",
    GET_RECOMMENDED_JOBS: "/api/jobs/recommended",
    GET_JOB_BY_ID: (id) => `/api/jobs/${id}`,
    POST_JOB: "/api/jobs",
    GET_JOBS_EMPLOYER: "/api/jobs/get-jobs-employer",
    UPDATE_JOB: (id) => `/api/jobs/${id}`,
    TOGGLE_CLOSE: (id) => `/api/jobs/${id}/toggle-close`,
    DELETE_JOB: (id) => `/api/jobs/${id}`,

    SAVE_JOB: (id) => `/api/save-jobs/${id}`,
    UNSAVE_JOB: (id) => `/api/save-jobs/${id}`,
    GET_SAVED_JOBS: "/api/save-jobs/my",
  },

  RESUME: {
    UPLOAD_RESUME: "/api/resume/upload",
  },

  APPLICATIONS: {
    APPLY_TO_JOB: (id) => `/api/applications/${id}`,
    GET_ALL_APPLICATIONS: (id) => `/api/applications/job/${id}`,
    UPDATE_STATUS: (id) => `/api/applications/${id}/status`,
  },

  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image", // Upload profile picture
  },

  ADMIN: {
    LOGIN: "/api/admin/login",
    JOBSEEKERS: "/api/admin/jobseekers",
    JOBSEEKER_STATUS: (id) => `/api/admin/jobseekers/${id}/status`,
    DELETE_JOBSEEKER: (id) => `/api/admin/jobseekers/${id}`,
    EMPLOYERS: "/api/admin/employers",
    EMPLOYER_BLOCK: (id) => `/api/admin/employers/${id}/block`,
    DELETE_EMPLOYER: (id) => `/api/admin/employers/${id}`,
    JOBS: "/api/admin/jobs",
    JOB_APPROVAL: (id) => `/api/admin/jobs/${id}/approval`,
    JOB_STATUS: (id) => `/api/admin/jobs/${id}/status`,
    DELETE_JOB: (id) => `/api/admin/jobs/${id}`,
  },
};
