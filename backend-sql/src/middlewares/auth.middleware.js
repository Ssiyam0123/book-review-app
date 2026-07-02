import jwt from "jsonwebtoken";
import { prisma } from "../index.js";

const protectRoute = async (req, res, next) => {
  try {
    // get token
    const authHeader = req.header("Authorization");
    console.log("SQL auth header:", authHeader);
    if (!authHeader) {
      console.log("SQL no auth header");
      return res.status(401).json({ message: "No authentication token, access denied" });
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      console.log("SQL no Bearer token");
      return res.status(401).json({ message: "No authentication token, access denied" });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("SQL decoded token:", decoded);

    // find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      console.log("SQL User not found for token:", decoded.userId);
      return res.status(401).json({ message: "Token is not valid" });
    }

    // Map Prisma id to _id for frontend compatibility
    req.user = { ...user, _id: user.id };
    next();
  } catch (error) {
    console.error("SQL Authentication error:", error.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default protectRoute;
