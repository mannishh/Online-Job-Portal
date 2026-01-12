import express from "express";

import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  toggleCloseJob,
  getJobsEmployer,
  getRecommendedJobs,
} from "../controllers/jobController.js";

import protect  from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, createJob)
  .get(getJobs);

// Recommended jobs for jobseeker (based on parsed resume)
router.get("/recommended", protect, getRecommendedJobs);

router.route("/get-jobs-employer")
  .get(protect, getJobsEmployer);

router.route("/:id")
  .get(getJobById)
  .put(protect, updateJob)
  .delete(protect, deleteJob);

router.put("/:id/toggle-close", protect, toggleCloseJob);

export default router;
