import  User  from "../models/User";
import  jwt  from "jsonwebtoken";

//generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "60d" });
};

// @desc Register new user
export const register = async (req, res) => {
  try {
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//@desc login user
export const login = async (req, res) => {};

//@desc get logged-in user
export const getMe = async (req, res) => {
  res.json(req.user);
};
