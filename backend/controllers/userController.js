import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";

// @desc    Update user profile (name, avatar, company details)
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const {
      name,
      avatar,
      companyName,
      companyDescription,
      companyLogo,
      resume,
    } = req.body;

    user.name = name || user.name;
    user.avatar = avatar || user.avatar;
    user.resume = resume || user.resume;

    //if employer allow updating company info
    if (user.role === "employer") {
      user.companyName = companyName || user.companyName;
      user.companyDescription = companyDescription || user.companyDescription;
      user.companyLogo = companyLogo || user.companyLogo;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      companyName: user.companyName,
      companyDescription: user.companyDescription,
      companyLogo: user.companyLogo,
      resume: user.resume || "",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete resume file (Jobseeker only)
export const deleteResume = async (req, res) => {
  try {
    const { resumeUrl } = req.body; // expect resumeUrl to be the URL of the resume

    // Safely extract filename from the URL (last segment after "/")
    const fileName = resumeUrl ? resumeUrl.split("/").pop() : null;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "jobseeker") {
      return res
        .status(403)
        .json({ message: "Only jobseekers can delete resume" });
    }

    // Only attempt file deletion if we actually have a filename
    if (fileName) {
      // Recreate __dirname for ES modules in this file
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      // construct the full file path
      const filePath = path.join(__dirname, "../uploads", fileName);

      // check if the file exists and then delete
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // delete the file
      }
    }

    // Clear the user's resume field even if the file wasn't found
    user.resume = "";
    await user.save();

    res.json({ message: "Resume deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get user public profile
export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
