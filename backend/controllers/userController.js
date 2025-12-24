import fs from "fs";
import path from "path";
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
    const { resumeUrl } = req.body; //expect resumeUrl to be the URL of the resume

    // extract filename from the url
    const fileName = resumeUrl?.split("/"?.pop());

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found " });

    if (user.role !== "jobseeker")
      return res
        .status(403)
        .json({ message: "Only jobseekers can delete resume" });

    // construct the full file path
    const filePath = path.join(__dirname, "../uploads", fileName);

    //check if the file exists and then delete
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // delete the file
    }

    //set the user's resume to an empty string
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
