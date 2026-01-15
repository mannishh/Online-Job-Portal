import express from "express";
import {
  adminLogin,
  getJobSeekers,
  toggleJobSeekerStatus,
  deleteJobSeeker,
  getEmployers,
  toggleEmployerBlock,
  deleteEmployer,
  getJobs,
  toggleJobApproval,
  toggleJobStatus,
  deleteJob,
} from "../controllers/adminController.js";
import protect from "../middlewares/authMiddleware.js";
import adminProtect from "../middlewares/adminMiddleware.js";

const router = express.Router();

// Admin login (public route)
router.post("/login", adminLogin);

// All routes below require admin authentication
router.use(protect);
router.use(adminProtect);

// Job Seekers routes
router.get("/jobseekers", getJobSeekers);
router.put("/jobseekers/:id/status", toggleJobSeekerStatus);
router.delete("/jobseekers/:id", deleteJobSeeker);

// Employers routes
router.get("/employers", getEmployers);
router.put("/employers/:id/block", toggleEmployerBlock);
router.delete("/employers/:id", deleteEmployer);

// Jobs routes
router.get("/jobs", getJobs);
router.put("/jobs/:id/approval", toggleJobApproval);
router.put("/jobs/:id/status", toggleJobStatus);
router.delete("/jobs/:id", deleteJob);

export default router;

