// Middleware to check if user is admin (use after protect middleware)
const adminProtect = async (req, res, next) => {
  try {
    // Check if user is admin (req.user should be set by protect middleware)
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Access denied. Admin only." });
    }
  } catch (error) {
    res.status(401).json({ message: "Not authorized", error: error.message });
  }
};

export default adminProtect;

