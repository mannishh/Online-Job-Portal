import jwt from "jsonwebtoken";
import User from "../models/User.js";

//Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (token && token.startsWith("Bearer")) {
      token = token.split(" ")[1]; //extract token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
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

      req.user = user;
      next();
    } else {
      res.status(401).json({ message: "Not Authorized, no token" });
    }
  } catch (error) {
    res.status(401).json({ message: "Token failed", error: error.message });
  }
};

export default protect;
