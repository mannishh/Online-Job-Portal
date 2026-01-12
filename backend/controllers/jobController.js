import Job from "../models/Job.js";
import User from "../models/User.js";
import Application from "../models/Application.js";
import SavedJob from "../models/SavedJob.js";
import ParsedResume from "../models/ParsedResume.js";
import {
  SKILLS_DB,
  normalizeText,
  extractSkills,
} from "../utils/resumeParser.js";

// @desc Create a new job (Employer only)
export const createJob = async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can post jobs" });
    }

    const job = await Job.create({ ...req.body, company: req.user._id });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get all jobs
export const getJobs = async (req, res) => {
  const { keyword, location, category, type, minSalary, maxSalary, userId } =
    req.query;

  const query = {
    isClosed: false,
    // Text search on title
    ...(keyword && { title: { $regex: keyword, $options: "i" } }),
    // Location search should depend on `location`, not `keyword`
    ...(location && { location: { $regex: location, $options: "i" } }),
    ...(category && { category }),
    ...(type && { type }),
  };

  if (minSalary || maxSalary) {
    query.$and = [];

    if (minSalary) {
      query.$and.push({ salaryMax: { $gte: Number(minSalary) } });
    }

    if (maxSalary) {
      query.$and.push({ salaryMin: { $lte: Number(maxSalary) } });
    }

    if (query.$and.length === 0) {
      delete query.$and;
    }
  }

  try {
    const jobs = await Job.find(query).populate(
      "company",
      "name companyName companyLogo"
    );

    let savedJobIds = [];
    let appliedJobStatusMap = {};

    if (userId) {
      //Saved Jobs
      const savedJobs = await SavedJob.find({ jobseeker: userId }).select(
        "job"
      );
      savedJobIds = savedJobs.map((s) => String(s.job));

      //Applications
      const applications = await Application.find({ applicant: userId }).select(
        "job status"
      );
      applications.forEach((app) => {
        appliedJobStatusMap[String(app.job)] = app.status;
      });
    }

    //Add isSaved and applicationStatus to each job
    const jobsWithExtras = jobs.map((job) => {
      const jobIdStr = String(job._id);
      return {
        ...job.toObject(),
        isSaved: savedJobIds.includes(jobIdStr),
        applicationStatus: appliedJobStatusMap[jobIdStr] || null,
      };
    });

    res.json(jobsWithExtras);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get recommended jobs for a jobseeker based on parsed resume
// @route   GET /api/jobs/recommended
// @access  Private (jobseeker)
export const getRecommendedJobs = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "jobseeker") {
      return res
        .status(403)
        .json({ message: "Only jobseekers can get recommendations" });
    }

    // Load parsed resume (cached)
    const parsed = await ParsedResume.findOne({ user: userId });

    if (!parsed) {
      // No parsed resume yet – return empty list without error
      return res.json([]);
    }

    const userSkills = parsed.skills || [];

    // Fetch all open jobs
    const jobs = await Job.find({ isClosed: false }).populate(
      "company",
      "name companyName companyLogo"
    );

    // Preload saved jobs and applications for this user
    const [savedJobs, applications] = await Promise.all([
      SavedJob.find({ jobseeker: userId }).select("job"),
      Application.find({ applicant: userId }).select("job status"),
    ]);

    const savedJobIds = new Set(savedJobs.map((s) => String(s.job)));
    const appliedJobStatusMap = {};
    applications.forEach((app) => {
      appliedJobStatusMap[String(app.job)] = app.status;
    });

    // For each job, derive skills from description/requirements text
    const recommended = [];

    jobs.forEach((job) => {
      const combinedText = `${job.description || ""}\n${
        job.requirements || ""
      }`;
      const normalized = normalizeText(combinedText);
      const jobSkills = extractSkills(normalized);

      if (!jobSkills.length || !userSkills.length) {
        return;
      }

      const jobSkillSet = new Set(jobSkills);
      let commonSkillsCount = 0;
      userSkills.forEach((s) => {
        if (jobSkillSet.has(s)) commonSkillsCount += 1;
      });

      const baseScore =
        jobSkills.length > 0 ? commonSkillsCount / jobSkills.length : 0;

      // Slightly lower threshold so more reasonable matches show up
      if (baseScore >= 0.2) {
        const jobObj = job.toObject();
        const jobIdStr = String(jobObj._id);

        recommended.push({
          ...jobObj,
          isSaved: savedJobIds.has(jobIdStr),
          applicationStatus: appliedJobStatusMap[jobIdStr] || null,
          matchScore: Number(baseScore.toFixed(2)),
        });
      }
    });

    // Sort: highest matchScore first
    recommended.sort((a, b) => b.matchScore - a.matchScore);

    return res.json(recommended);
  } catch (err) {
    console.error("Error getting recommended jobs:", err);
    return res
      .status(500)
      .json({ message: "Failed to get recommended jobs", error: err.message });
  }
};

// @desc Get jobs for logged in user (Employer can see posted jobs)
export const getJobsEmployer = async (req, res) => {
  try {
    const userId = req.user._id;
    const { role } = req.user;

    if (role !== "employer") {
      return res.status(403).json({ message: "Access denied" });
    }

    //Get all jobs posted by employer
    const jobs = await Job.find({ company: userId })
      .populate("company", "name companyName companyLogo")
      .lean(); // .lean() makes jobs plain JS objects so we can add new fields

    // Count applications for each job
    const jobsWithApplicationCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({
          job: job._id,
        });
        return {
          ...job,
          applicationCount,
        };
      })
    );

    res.json(jobsWithApplicationCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//@desc get single job by id
export const getJobById = async (req, res) => {
  try {
    const { userId } = req.query;

    const job = await Job.findById(req.params.id).populate(
      "company",
      "name companyName companyLogo"
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    let applicationStatus = null;

    if (userId) {
      const application = await Application.findOne({
        job: job._id,
        applicant: userId,
      }).select("status");

      if (application) {
        applicationStatus = application.status;
      }
    }

    res.json({
      ...job.toObject(),
      applicationStatus,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//@desc Update a job (employer only)
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.company.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this job" });
    }

    Object.assign(job, req.body);
    const updated = await job.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//@desc delete a job (employer only)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.company.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this job" });
    }

    await job.deleteOne();
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//@desc toggle close status for a job (employer only)
export const toggleCloseJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.company.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to close this job" });
    }
    job.isClosed = !job.isClosed;
    await job.save();

    res.json({ message: "Job marked as closed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
