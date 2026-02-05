import fs from "fs";
import ParsedResume from "../models/ParsedResume.js";
import {
  extractTextFromResume,
  normalizeText,
  extractSkills,
  extractTotalExperienceYears,
  extractEducation,
} from "../utils/resumeParser.js";

// @desc    Upload and parse resume (PDF/DOCX)
// @route   POST /api/resume/upload
// @access  Private (jobseeker)
export const uploadAndParseResume = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "jobseeker") {
      return res
        .status(403)
        .json({ message: "Only jobseekers can upload resumes" });
    }

    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No resume file uploaded" });
    }

    const filePath = file.path;
    const mimetype = file.mimetype;

    // Check if we already parsed a resume for this user with same filename (basic duplicate prevention)
    const existing = await ParsedResume.findOne({
      user: req.user._id,
      fileName: file.filename,
    });

    if (existing) {
      return res.json({
        source: "cache",
        parsedResume: existing,
      });
    }

    // Step 2: Extract raw text
    const rawText = await extractTextFromResume(filePath, mimetype);

    // Step 3: Normalize
    const normalizedText = normalizeText(rawText);

    // Step 4: Skills
    const skills = extractSkills(normalizedText);

    // Step 5: Experience
    const totalExperienceYears = extractTotalExperienceYears(rawText);

    // Education
    const education = extractEducation(rawText);

    // Step 6: Save parsed resume (cache)
    const parsedResumeData = {
      user: req.user._id,
      fileName: file.filename,
      skills,
      totalExperienceYears,
      education,
      resumeText: rawText,
      meta: {
        size: file.size,
        originalName: file.originalname,
        mimetype: file.mimetype,
      },
    };

    const parsedResume = await ParsedResume.findOneAndUpdate(
      { user: req.user._id },
      parsedResumeData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Optional: remove the file after parsing, comment this out if you want to keep it
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      // swallow error – file cleanup failure shouldn't break response
    }

    return res.status(201).json({
      source: "parsed",
      parsedResume,
    });
  } catch (err) {
    console.error("Error parsing resume:", err);
    return res
      .status(500)
      .json({ message: "Failed to parse resume", error: err.message });
  }
};

// @desc    Get parsed resume for current user (debug/inspection)
// @route   GET /api/resume/me
// @access  Private (jobseeker)
export const getMyParsedResume = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "jobseeker") {
      return res
        .status(403)
        .json({ message: "Only jobseekers can access parsed resume" });
    }

    const parsed = await ParsedResume.findOne({ user: req.user._id });

    if (!parsed) {
      return res.status(404).json({ message: "No parsed resume found" });
    }

    return res.json(parsed);
  } catch (err) {
    console.error("Error fetching parsed resume:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch parsed resume", error: err.message });
  }
};
