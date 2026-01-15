import User from "../models/User.js";
import Job from "../models/Job.js";
import jwt from "jsonwebtoken";

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "60d" });
};

// @desc Admin login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: "admin" });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// ========== JOB SEEKERS MANAGEMENT ==========

// @desc Get all job seekers
export const getJobSeekers = async (req, res) => {
  try {
    const jobSeekers = await User.find({ role: "jobseeker" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(jobSeekers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Activate/Deactivate job seeker
export const toggleJobSeekerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user || user.role !== "jobseeker") {
      return res.status(404).json({ message: "Job seeker not found" });
    }

    user.isActive = isActive;
    await user.save();

    res.json({ message: `Job seeker ${isActive ? "activated" : "deactivated"}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete job seeker
export const deleteJobSeeker = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user || user.role !== "jobseeker") {
      return res.status(404).json({ message: "Job seeker not found" });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: "Job seeker deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== EMPLOYERS MANAGEMENT ==========

// @desc Get all employers
export const getEmployers = async (req, res) => {
  try {
    const employers = await User.find({ role: "employer" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(employers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Block/Unblock employer
export const toggleEmployerBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    const user = await User.findById(id);
    if (!user || user.role !== "employer") {
      return res.status(404).json({ message: "Employer not found" });
    }

    user.isBlocked = isBlocked;
    await user.save();

    res.json({ message: `Employer ${isBlocked ? "blocked" : "unblocked"}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete employer
export const deleteEmployer = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user || user.role !== "employer") {
      return res.status(404).json({ message: "Employer not found" });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: "Employer deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== JOBS MANAGEMENT ==========

// @desc Get all jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("company", "name email companyName")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Approve/Reject job
export const toggleJobApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.isApproved = isApproved;
    await job.save();

    res.json({ message: `Job ${isApproved ? "approved" : "rejected"}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Change job status (active/inactive)
export const toggleJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isClosed } = req.body;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.isClosed = isClosed;
    await job.save();

    res.json({ message: `Job ${isClosed ? "closed" : "activated"}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete job
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    await Job.findByIdAndDelete(id);
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

