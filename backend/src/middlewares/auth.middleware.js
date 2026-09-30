import jwt from "jsonwebtoken";
import blacklistModel from "../models/blacklist.model.js";

const authUser = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized: No token provided",
    });
  }

  const isTokenBlacklisted = await blacklistModel.findOne({ token });

  if (isTokenBlacklisted) {
    return res.status(401).json({
      message: "Unauthorized: Invalid token",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized: Invalid token",
    });
  }
};

export default authUser;
