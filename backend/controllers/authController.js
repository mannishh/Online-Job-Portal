import User from "../models/User.js";
import jwt from "jsonwebtoken";

//generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "60d" });
};

// @desc Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password, avatar, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, role, avatar });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      token: generateToken(user._id),
      companyName: user.companyName || "",
      companyDescription: user.companyDescription || "",
      companyLogo: user.companyLogo || "",
      resume: user.resume || "",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//@desc login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check account status based on role
    if (user.role === "jobseeker" && !user.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    if (user.role === "employer" && user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked. Please contact support.",
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      avatar: user.avatar || "",
      companyName: user.companyName || "",
      companyDescription: user.companyDescription || "",
      companyLogo: user.companyLogo || "",
      resume: user.resume || "",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

//@desc get logged-in user
export const getMe = async (req, res) => {
  try {
    const user = req.user;
    
    // Refresh user data from database to get latest status
    const freshUser = await User.findById(user._id).select("-password");
    
    if (!freshUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check account status
    if (freshUser.role === "jobseeker" && !freshUser.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    if (freshUser.role === "employer" && freshUser.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked. Please contact support.",
      });
    }

    res.json({
      _id: freshUser._id,
      name: freshUser.name,
      email: freshUser.email,
      role: freshUser.role,
      avatar: freshUser.avatar || "",
      companyName: freshUser.companyName || "",
      companyDescription: freshUser.companyDescription || "",
      companyLogo: freshUser.companyLogo || "",
      resume: freshUser.resume || "",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
